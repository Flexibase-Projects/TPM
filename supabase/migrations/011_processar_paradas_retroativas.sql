-- Migração: Processar paradas retroativas para OMs concluídas sem paradas
-- Processa OMs que foram concluídas antes da correção do trigger
-- Todas as tabelas têm o prefixo TPM_

-- Função para processar uma OM concluída e criar parada se necessário
CREATE OR REPLACE FUNCTION processar_parada_retroativa(ocorrencia_record RECORD)
RETURNS VOID AS $$
DECLARE
  data_ocorrencia DATE;
  data_fechamento DATE;
  hora_inicio_ocorrencia TIME;
  hora_fim_ocorrencia TIME;
  horas_calculadas DECIMAL;
  data_atual DATE;
  parada_existente INTEGER;
BEGIN
  -- Verificar se já existe parada para esta ocorrência
  SELECT COUNT(*) INTO parada_existente
  FROM "TPM_paradas"
  WHERE ocorrencia_id = ocorrencia_record.id;
  
  -- Se já existe parada, não processar
  IF parada_existente > 0 THEN
    RETURN;
  END IF;
  
  -- Extrair data e hora da ocorrência
  data_ocorrencia := DATE(ocorrencia_record.data_ocorrencia);
  data_fechamento := DATE(ocorrencia_record.data_fechamento);
  hora_inicio_ocorrencia := ocorrencia_record.data_ocorrencia::TIME;
  hora_fim_ocorrencia := ocorrencia_record.data_fechamento::TIME;

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
        ocorrencia_record.maquinario_id,
        ocorrencia_record.id,
        data_ocorrencia,
        hora_inicio_ocorrencia,
        hora_fim_ocorrencia,
        horas_calculadas,
        'Automatico'
      );
      
      -- Deduzir tempo disponível
      INSERT INTO "TPM_tempo_disponivel_diario" (maquinario_id, data, horas_disponiveis)
      VALUES (ocorrencia_record.maquinario_id, data_ocorrencia, 10.00)
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
        ocorrencia_record.maquinario_id,
        ocorrencia_record.id,
        data_ocorrencia,
        hora_inicio_ocorrencia,
        '18:00:00',
        horas_calculadas,
        'Automatico'
      );
      
      -- Deduzir tempo disponível do primeiro dia
      INSERT INTO "TPM_tempo_disponivel_diario" (maquinario_id, data, horas_disponiveis)
      VALUES (ocorrencia_record.maquinario_id, data_ocorrencia, 10.00)
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
        ocorrencia_record.maquinario_id,
        ocorrencia_record.id,
        data_atual,
        '08:00:00',
        '18:00:00',
        10.00,
        'Automatico'
      );
      
      -- Deduzir tempo disponível dos dias intermediários
      INSERT INTO "TPM_tempo_disponivel_diario" (maquinario_id, data, horas_disponiveis)
      VALUES (ocorrencia_record.maquinario_id, data_atual, 10.00)
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
        ocorrencia_record.maquinario_id,
        ocorrencia_record.id,
        data_fechamento,
        '08:00:00',
        hora_fim_ocorrencia,
        horas_calculadas,
        'Automatico'
      );
      
      -- Deduzir tempo disponível do último dia
      INSERT INTO "TPM_tempo_disponivel_diario" (maquinario_id, data, horas_disponiveis)
      VALUES (ocorrencia_record.maquinario_id, data_fechamento, 10.00)
      ON CONFLICT (maquinario_id, data) 
      DO UPDATE SET horas_disponiveis = GREATEST(0, "TPM_tempo_disponivel_diario".horas_disponiveis - horas_calculadas);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Processar todas as OMs concluídas que não têm paradas associadas
DO $$
DECLARE
  ocorrencia_record RECORD;
  total_processadas INTEGER := 0;
BEGIN
  -- Buscar todas as OMs concluídas que são Corretivas e não têm paradas
  FOR ocorrencia_record IN
    SELECT o.*
    FROM "TPM_ocorrencias_manutencao" o
    WHERE o.status = 'concluído'
      AND o.data_fechamento IS NOT NULL
      AND (o.tipo_om = 'Corretiva' OR o.tipo_om IS NULL)
      AND NOT EXISTS (
        SELECT 1
        FROM "TPM_paradas" p
        WHERE p.ocorrencia_id = o.id
      )
    ORDER BY o.data_ocorrencia
  LOOP
    -- Processar cada ocorrência
    PERFORM processar_parada_retroativa(ocorrencia_record);
    total_processadas := total_processadas + 1;
  END LOOP;
  
  -- Log do resultado (pode ser visto nos logs do banco)
  RAISE NOTICE 'Processadas % ocorrências concluídas sem paradas', total_processadas;
END;
$$;

-- Manter a função disponível para uso futuro se necessário
-- Pode ser chamada manualmente: SELECT processar_parada_retroativa(ROW(...)::TPM_ocorrencias_manutencao);
