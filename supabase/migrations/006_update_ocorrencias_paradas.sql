-- Migração: Atualização da tabela de Ocorrências de Manutenção para suportar paradas automáticas
-- Todas as tabelas têm o prefixo TPM_

-- Adicionar campo data_fechamento na tabela de ocorrências
ALTER TABLE "TPM_ocorrencias_manutencao" 
ADD COLUMN IF NOT EXISTS data_fechamento TIMESTAMP WITH TIME ZONE;

-- Criar função para calcular horas de parada considerando horário de trabalho (8h-18h)
CREATE OR REPLACE FUNCTION calcular_horas_parada(
  hora_inicio TIME,
  hora_fim TIME
) RETURNS DECIMAL AS $$
DECLARE
  inicio_trabalho TIME := '08:00:00';
  fim_trabalho TIME := '18:00:00';
  inicio_efetivo TIME;
  fim_efetivo TIME;
  horas DECIMAL;
BEGIN
  -- Ajustar início para não ser antes das 8h
  IF hora_inicio < inicio_trabalho THEN
    inicio_efetivo := inicio_trabalho;
  ELSE
    inicio_efetivo := hora_inicio;
  END IF;

  -- Ajustar fim para não ser depois das 18h
  IF hora_fim > fim_trabalho THEN
    fim_efetivo := fim_trabalho;
  ELSE
    fim_efetivo := hora_fim;
  END IF;

  -- Calcular horas (em decimal)
  horas := EXTRACT(EPOCH FROM (fim_efetivo - inicio_efetivo)) / 3600.0;

  -- Retornar 0 se o resultado for negativo ou zero
  IF horas <= 0 THEN
    RETURN 0;
  END IF;

  RETURN horas;
END;
$$ LANGUAGE plpgsql;

-- Criar função para criar parada automática quando OM é fechada
CREATE OR REPLACE FUNCTION criar_parada_automatica()
RETURNS TRIGGER AS $$
DECLARE
  data_ocorrencia DATE;
  data_fechamento DATE;
  hora_inicio_ocorrencia TIME;
  hora_fim_ocorrencia TIME;
  horas_calculadas DECIMAL;
  data_atual DATE;
  horas_dia DECIMAL;
BEGIN
  -- Apenas processar quando status muda para 'Concluída' e data_fechamento é definida
  IF NEW.status = 'Concluída' AND NEW.data_fechamento IS NOT NULL AND 
     (OLD.status IS NULL OR OLD.status != 'Concluída' OR OLD.data_fechamento IS NULL) THEN
    
    -- Extrair data e hora da ocorrência
    data_ocorrencia := DATE(NEW.data_ocorrencia);
    data_fechamento := DATE(NEW.data_fechamento);
    hora_inicio_ocorrencia := NEW.data_ocorrencia::TIME;
    hora_fim_ocorrencia := NEW.data_fechamento::TIME;

    -- Se ocorrência e fechamento são no mesmo dia
    IF data_ocorrencia = data_fechamento THEN
      -- Calcular horas paradas
      horas_calculadas := calcular_horas_parada(hora_inicio_ocorrencia, hora_fim_ocorrencia);
      
      IF horas_calculadas > 0 THEN
        -- Criar parada única
        INSERT INTO "TPM_paradas" (
          maquinario_id,
          ocorrencia_id,
          data_parada,
          hora_inicio,
          hora_fim,
          horas_paradas,
          tipo_registro
        ) VALUES (
          NEW.maquinario_id,
          NEW.id,
          data_ocorrencia,
          hora_inicio_ocorrencia,
          hora_fim_ocorrencia,
          horas_calculadas,
          'Automatico'
        );
        
        -- Deduzir tempo disponível
        INSERT INTO "TPM_tempo_disponivel_diario" (maquinario_id, data, horas_disponiveis)
        VALUES (NEW.maquinario_id, data_ocorrencia, 10.00)
        ON CONFLICT (maquinario_id, data) 
        DO UPDATE SET horas_disponiveis = GREATEST(0, "TPM_tempo_disponivel_diario".horas_disponiveis - horas_calculadas);
      END IF;
    ELSE
      -- Distribuir entre múltiplos dias
      -- Dia 1: da hora de início até 18h
      horas_calculadas := calcular_horas_parada(hora_inicio_ocorrencia, '18:00:00');
      IF horas_calculadas > 0 THEN
        INSERT INTO "TPM_paradas" (
          maquinario_id,
          ocorrencia_id,
          data_parada,
          hora_inicio,
          hora_fim,
          horas_paradas,
          tipo_registro
        ) VALUES (
          NEW.maquinario_id,
          NEW.id,
          data_ocorrencia,
          hora_inicio_ocorrencia,
          '18:00:00',
          horas_calculadas,
          'Automatico'
        );
        
        -- Deduzir tempo disponível do primeiro dia
        INSERT INTO "TPM_tempo_disponivel_diario" (maquinario_id, data, horas_disponiveis)
        VALUES (NEW.maquinario_id, data_ocorrencia, 10.00)
        ON CONFLICT (maquinario_id, data) 
        DO UPDATE SET horas_disponiveis = GREATEST(0, "TPM_tempo_disponivel_diario".horas_disponiveis - horas_calculadas);
      END IF;

      -- Dias intermediários (se houver): 8h-18h (10h completas)
      data_atual := data_ocorrencia + INTERVAL '1 day';
      WHILE data_atual < data_fechamento LOOP
        INSERT INTO "TPM_paradas" (
          maquinario_id,
          ocorrencia_id,
          data_parada,
          hora_inicio,
          hora_fim,
          horas_paradas,
          tipo_registro
        ) VALUES (
          NEW.maquinario_id,
          NEW.id,
          data_atual,
          '08:00:00',
          '18:00:00',
          10.00,
          'Automatico'
        );
        
        -- Deduzir tempo disponível dos dias intermediários
        INSERT INTO "TPM_tempo_disponivel_diario" (maquinario_id, data, horas_disponiveis)
        VALUES (NEW.maquinario_id, data_atual, 10.00)
        ON CONFLICT (maquinario_id, data) 
        DO UPDATE SET horas_disponiveis = GREATEST(0, "TPM_tempo_disponivel_diario".horas_disponiveis - 10.00);
        
        data_atual := data_atual + INTERVAL '1 day';
      END LOOP;

      -- Último dia: de 8h até hora de fechamento
      horas_calculadas := calcular_horas_parada('08:00:00', hora_fim_ocorrencia);
      IF horas_calculadas > 0 THEN
        INSERT INTO "TPM_paradas" (
          maquinario_id,
          ocorrencia_id,
          data_parada,
          hora_inicio,
          hora_fim,
          horas_paradas,
          tipo_registro
        ) VALUES (
          NEW.maquinario_id,
          NEW.id,
          data_fechamento,
          '08:00:00',
          hora_fim_ocorrencia,
          horas_calculadas,
          'Automatico'
        );
        
        -- Deduzir tempo disponível do último dia
        INSERT INTO "TPM_tempo_disponivel_diario" (maquinario_id, data, horas_disponiveis)
        VALUES (NEW.maquinario_id, data_fechamento, 10.00)
        ON CONFLICT (maquinario_id, data) 
        DO UPDATE SET horas_disponiveis = GREATEST(0, "TPM_tempo_disponivel_diario".horas_disponiveis - horas_calculadas);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para criar parada automática quando OM é fechada
DROP TRIGGER IF EXISTS trigger_criar_parada_automatica ON "TPM_ocorrencias_manutencao";
CREATE TRIGGER trigger_criar_parada_automatica
  AFTER UPDATE ON "TPM_ocorrencias_manutencao"
  FOR EACH ROW
  EXECUTE FUNCTION criar_parada_automatica();
