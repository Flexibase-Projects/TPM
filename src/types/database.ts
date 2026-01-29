// Tipos do banco de dados Supabase
// Este arquivo será expandido conforme as tabelas forem criadas
// Todas as tabelas devem ter o prefixo TPM_

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Tabelas serão adicionadas aqui conforme criadas
      // Exemplo: TPM_maquinas: { ... }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
