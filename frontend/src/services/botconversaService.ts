const API_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://backend-51b4vjdmz-ti-desenhars-projects.vercel.app/proxy'
    : 'http://localhost:4000/proxy';

/**
 * Cria contato e envia mensagem via backend proxy
 */
export async function criarContatoENotificar(
  nome: string,
  telefone: string,
  mensagem: string
): Promise<{ sucesso: boolean; mensagem?: string }> {
  try {
    // Cria contato
    const resContato = await fetch(`${API_URL}/contatos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone }),
    });

    const dataContato = await resContato.json();
    if (!resContato.ok) {
      console.error('Erro ao criar contato:', dataContato);
      return { sucesso: false, mensagem: dataContato.error || 'Erro ao criar contato.' };
    }

    console.log('Contato criado:', dataContato);

    // Envia mensagem
    const resMensagem = await fetch(`${API_URL}/mensagens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefone, mensagem }),
    });

    const dataMensagem = await resMensagem.json();
    if (!resMensagem.ok) {
      console.error('Erro ao enviar mensagem:', dataMensagem);
      return { sucesso: false, mensagem: dataMensagem.error || 'Erro ao enviar mensagem.' };
    }

    console.log('Mensagem enviada:', dataMensagem);
    return { sucesso: true };

  } catch (error) {
    console.error('Erro geral no criarContatoENotificar:', error);
    return { sucesso: false, mensagem: 'Erro de conexão com o servidor.' };
  }
}
