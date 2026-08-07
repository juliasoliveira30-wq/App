const formulario = document.getElementById('formulario');
const mensagem = document.getElementById('mensagem');

function formatarData(data) {
    const opcao = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(data).toLocaleDateString('pt-BR', opcao);
}

function validarTelefone(telefone) {
    const apenasDigitos = telefone.replace(/\D/g, '');
    return apenasDigitos.length >= 10 && apenasDigitos.length <= 11;
}

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;

    if (!nome || !telefone || !data) {
        mensagem.innerHTML = '<div class="message-error">Por favor, preencha todos os campos obrigatórios antes de enviar.</div>';
        return;
    }

    if (!validarTelefone(telefone)) {
        mensagem.innerHTML = '<div class="message-error">Digite um telefone válido com 10 ou 11 dígitos.</div>';
        return;
    }

    mensagem.innerHTML = `
        <div class="message-success">
            <h3 class="font-bold">✅ Agendamento confirmado!</h3>
            <p class="mt-2"><strong>${nome}</strong>, seu horário foi reservado com sucesso.</p>
            <p class="mt-2">Serviço: <strong>${servico}</strong></p>
            <p>Data: <strong>${formatarData(data)}</strong></p>
            <p>Horário: <strong>${hora}</strong></p>
            <p>Telefone: <strong>${telefone}</strong></p>
        </div>
    `;

    formulario.reset();
});