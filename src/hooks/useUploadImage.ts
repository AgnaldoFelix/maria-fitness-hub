import { useMutation } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toast } from 'sonner';

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      try {
        console.log('📤 Iniciando upload da imagem:', file.name, file.size);
        
        // Validar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          throw new Error('Tipo de arquivo inválido. Use JPEG, PNG, WebP ou GIF.');
        }

        // Validar tamanho (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error('A imagem deve ter no máximo 5MB.');
        }

        // Gerar nome único para o arquivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

        console.log('📁 Fazendo upload para:', fileName);

        // Usar o cliente admin para bypass RLS
        const { data, error } = await supabaseAdmin.storage
          .from('products')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('❌ Erro no upload:', error);
          throw new Error(`Erro ao fazer upload: ${error.message}`);
        }

        console.log('✅ Upload realizado, obtendo URL pública...');

        // Obter URL pública
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('products')
          .getPublicUrl(fileName);

        console.log('🔗 URL pública:', publicUrl);
        return publicUrl;

      } catch (error: any) {
        console.error('💥 Erro no processo de upload:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('🚨 Erro no mutation:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    },
    onSuccess: () => {
      toast.success('Imagem enviada com sucesso!');
    }
  });
}