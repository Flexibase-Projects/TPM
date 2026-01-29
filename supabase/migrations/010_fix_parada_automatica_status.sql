-- Migração: Correção do trigger de paradas automáticas
-- Corrige o status de 'Concluída' para 'concluído' e adiciona verificações de segurança
-- Todas as tabelas têm o prefixo TPM_

-- Recriar função para criar parada automática quando OM é fechada
-- Corrige o status de 'Concluída' para 'concluído' e adiciona verificações
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
  parada_existente INTEGER;
BEGIN
  -- Apenas processar quando:
  -- 1. Status muda para 'concluído' (com acento, minúsculo)
  -- 2. data_fechamento é definida
  -- 3. É OM Corretiva (tipo_om = 'Corretiva' OR tipo_om IS NULL)
  -- 4. Status anterior não era 'concluído' ou não tinha data_fechamento
  IF NEW.status = 'concluído' 
     AND NEW.data_fechamento IS NOT NULL 
     AND (NEW.tipo_om = 'Corretiva' OR NEW.tipo_om IS NULL)
     AND (OLD.status IS NULL OR OLD.status != 'concluído' OR OLD.data_fechamento IS NULL) THEN
    
    -- Verificar se já existe parada para esta ocorrência (evitar duplicatas)
    SELECT COUNT(*) INTO parada_existente
    FROM "TPM_paradas"
    WHERE ocorrencia_id = NEW.id;
    
    -- Se já existe parada, não criar novamente
    IF parada_existente > 0 THEN
      RETURN NEW;
    END IF;
    
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

-- O trigger já existe, então não precisamos recriá-lo
-- A função foi atualizada acima e o trigger continuará funcionando
