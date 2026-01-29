-- Migração: Criar sistema de histórico de status (timeline) para OMs
-- Todas as tabelas têm o prefixo TPM_

-- Criar tabela de histórico de status
CREATE TABLE IF NOT EXISTS "TPM_ocorrencias_status_historico" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocorrencia_id UUID NOT NULL REFERENCES "TPM_ocorrencias_manutencao"(id) ON DELETE CASCADE,
  status_anterior VARCHAR(20),
  status_novo VARCHAR(20) NOT NULL,
  comentario TEXT,
  responsavel VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_ocorrencia ON "TPM_ocorrencias_status_historico"(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_historico_status ON "TPM_ocorrencias_status_historico"(status_novo);
CREATE INDEX IF NOT EXISTS idx_historico_data ON "TPM_ocorrencias_status_historico"(created_at);

-- Adicionar campos na tabela de ocorrências
ALTER TABLE "TPM_ocorrencias_manutencao"
ADD COLUMN IF NOT EXISTS data_recebimento TIMESTAMP WITH TIME ZONE;

-- Função para calcular tempos baseado na timeline
CREATE OR REPLACE FUNCTION calcular_tempos_om(ocorrencia_id_param UUID)
RETURNS TABLE (
  tempo_em_fila DECIMAL,
  tempo_em_execucao DECIMAL,
  tempo_total DECIMAL
) AS $$
DECLARE
  data_recebimento TIMESTAMP WITH TIME ZONE;
  data_atual TIMESTAMP WITH TIME ZONE := NOW();
  tempo_fila DECIMAL := 0;
  tempo_execucao DECIMAL := 0;
  tempo_total_calc DECIMAL := 0;
  registro RECORD;
  data_inicio_status TIMESTAMP WITH TIME ZONE;
  data_fim_status TIMESTAMP WITH TIME ZONE;
  status_atual VARCHAR(20);
  data_fechamento TIMESTAMP WITH TIME ZONE;
  horas_periodo DECIMAL;
  tem_historico BOOLEAN;
BEGIN
  -- Buscar data de recebimento e status atual
  SELECT data_recebimento, status, data_fechamento 
  INTO data_recebimento, status_atual, data_fechamento
  FROM "TPM_ocorrencias_manutencao"
  WHERE id = ocorrencia_id_param;

  -- Se não tem data de recebimento, retornar zeros
  IF data_recebimento IS NULL THEN
    RETURN QUERY SELECT 0::DECIMAL, 0::DECIMAL, 0::DECIMAL;
    RETURN;
  END IF;

  -- Definir data de fim (fechamento se concluído, senão agora)
  IF status_atual = 'concluído' AND data_fechamento IS NOT NULL THEN
    data_atual := data_fechamento;
  END IF;

  -- Calcular tempo total
  tempo_total_calc := EXTRACT(EPOCH FROM (data_atual - data_recebimento)) / 3600.0;

  -- Calcular tempos em cada status baseado na timeline
  -- Percorrer histórico e calcular períodos entre transições
  FOR registro IN
    SELECT 
      h1.status_novo,
      h1.created_at as inicio_periodo,
      COALESCE(
        (SELECT MIN(h2.created_at) 
         FROM "TPM_ocorrencias_status_historico" h2 
         WHERE h2.ocorrencia_id = ocorrencia_id_param 
           AND h2.created_at > h1.created_at),
        data_atual
      ) as fim_periodo
    FROM "TPM_ocorrencias_status_historico" h1
    WHERE h1.ocorrencia_id = ocorrencia_id_param
    ORDER BY h1.created_at
  LOOP
    horas_periodo := EXTRACT(EPOCH FROM (registro.fim_periodo - registro.inicio_periodo)) / 3600.0;
    
    -- Acumular tempo conforme o status
    IF registro.status_novo = 'na fila' THEN
      tempo_fila := tempo_fila + horas_periodo;
    ELSIF registro.status_novo = 'em execução' THEN
      tempo_execucao := tempo_execucao + horas_periodo;
    END IF;
  END LOOP;
  
  -- Verificar se há histórico
  SELECT EXISTS(
    SELECT 1 FROM "TPM_ocorrencias_status_historico" 
    WHERE ocorrencia_id = ocorrencia_id_param
  ) INTO tem_historico;

  -- Se não há histórico mas tem status atual, considerar período desde recebimento
  IF NOT tem_historico AND data_recebimento IS NOT NULL THEN
    IF status_atual = 'na fila' THEN
      tempo_fila := tempo_total_calc;
    ELSIF status_atual = 'em execução' THEN
      tempo_execucao := tempo_total_calc;
    END IF;
  END IF;

  RETURN QUERY SELECT 
    ROUND(COALESCE(tempo_fila, 0)::DECIMAL, 2),
    ROUND(COALESCE(tempo_execucao, 0)::DECIMAL, 2),
    ROUND(COALESCE(tempo_total_calc, 0)::DECIMAL, 2);
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para registrar automaticamente mudanças de status na timeline
-- (será chamado manualmente via função, mas podemos criar um trigger também)
CREATE OR REPLACE FUNCTION registrar_status_historico()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou, registrar na timeline
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO "TPM_ocorrencias_status_historico" (
      ocorrencia_id,
      status_anterior,
      status_novo,
      responsavel,
      created_at
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.responsavel,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_registrar_status_historico ON "TPM_ocorrencias_manutencao";
CREATE TRIGGER trigger_registrar_status_historico
  AFTER UPDATE ON "TPM_ocorrencias_manutencao"
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION registrar_status_historico();
