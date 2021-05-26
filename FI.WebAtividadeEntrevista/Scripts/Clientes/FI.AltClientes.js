var benefList = [];

$(document).ready(function () {

    $('#CPF').mask('000.000.000-00', { reverse: true });
    $("#BeneficiarioCpf").mask('000.000.000-00', { reverse: true });
    $('#CEP').mask('00000-000');
    $('#Telefone').mask('(00) 0000-0000');

    if (obj) {
        $('#formCadastro #Nome').val(obj.Nome);
        $('#formCadastro #CEP').val(obj.CEP);
        $('#formCadastro #Email').val(obj.Email);
        $('#formCadastro #Sobrenome').val(obj.Sobrenome);
        $('#formCadastro #Nacionalidade').val(obj.Nacionalidade);
        $('#formCadastro #Estado').val(obj.Estado);
        $('#formCadastro #Cidade').val(obj.Cidade);
        $('#formCadastro #Logradouro').val(obj.Logradouro);
        $('#formCadastro #Telefone').val(obj.Telefone);
        $('#formCadastro #CPF').val(obj.CPF);

        benefList = obj.Beneficiarios;
        MontarTabelaBeneficiarios();
    }

    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        $.ajax({
            url: urlPost,
            method: "POST",
            data: {
                "NOME": $(this).find("#Nome").val(),
                "CEP": $(this).find("#CEP").val(),
                "Email": $(this).find("#Email").val(),
                "Sobrenome": $(this).find("#Sobrenome").val(),
                "Nacionalidade": $(this).find("#Nacionalidade").val(),
                "Estado": $(this).find("#Estado").val(),
                "Cidade": $(this).find("#Cidade").val(),
                "Logradouro": $(this).find("#Logradouro").val(),
                "Telefone": $(this).find("#Telefone").val(),
                "CPF": $(this).find("#CPF").val(),
                "Beneficiarios": benefList
            },
            error:
                function (r) {
                    if (r.status == 400)
                        ModalDialog("Ocorreu um erro", r.responseJSON);
                    else if (r.status == 500)
                        ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                },
            success:
                function (r) {
                    ModalDialog("Sucesso!", r)
                    $("#formCadastro")[0].reset();
                    window.location.href = urlRetorno;
                }
        });
    });

    $('#IncluirBeneficiario').click(function (e) {
        e.preventDefault();

        var benefCpf = $("#BeneficiarioCpf").val();
        var benefNome = $("#BeneficiarioNome").val();

        if (benefCpf && benefNome) {
            $.ajax({
                url: urlValidaCpf,
                method: "POST",
                data: {
                    "CPF": $("#BeneficiarioCpf").val()
                },
                error:
                    function (r) {
                        ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                    },
                success:
                    function (valid) {
                        if (valid) {
                            if (!benefList.find(b => b.CPF == benefCpf)) {
                                benefList.push({ 'Id': 0, 'Nome': benefNome, 'CPF': benefCpf });
                                AdicionarBeneficiarioNaTabela(benefNome, benefCpf);
                            } else {
                                ModalDialog("Ocorreu um erro", "CPF duplicado na lista de beneficiários.");
                            }
                        } else {
                            ModalDialog("Ocorreu um erro", "CPF inválido.");
                        }
                    },
                complete:
                    function () {
                        $("#formBeneficiario")[0].reset();
                    }
            });
        } else {
            ModalDialog("Ocorreu um erro", "Todos os campos do beneficiário devem ser preenchidos.");
        }
    });

});

function Operacoes(cpf) {
    return '<button class="btn btn-info btn-sm" style="margin-right: 10px;" onclick="AlterarBeneficiario(this);" type="button">Alterar</button>' +
        '<button class="btn btn-info btn-sm" onclick="ExcluirBeneficiario(this,  \'' + cpf + '\');" type="button">Excluir</button>';
}

function OperacoesEdicao(cpf, nome, pos) {
    return '<button class="btn btn-success btn-sm" style="margin-right: 10px;" onclick="SalvarAlteracaoBeneficiario(this, \'' + cpf + '\', \'' + pos + '\');" type="button">Salvar</button>' +
        '<button class="btn btn-danger btn-sm" onclick="CancelarAlteracaoBeneficiario(this, \'' + cpf + '\', \'' + nome + '\');" type="button">Cancelar</button>';
}

function DebugList() {
    console.log(benefList);
}

function MontarTabelaBeneficiarios() {
    var linhas;

    benefList.forEach(function (value) {
        linhas += '<tr>' +
            '<td>' + value['CPF'] + '</td>' +
            '<td>' + value['Nome'] + '</td>' +
            '<td>' +
            Operacoes(value['CPF']) +
            '</td>' +
            '</tr>';
    });

    $('#TableBeneficiario tbody').append(linhas);
}

function AdicionarBeneficiarioNaTabela(nome, cpf) {
    var linha = '<tr>' +
        '<td>' + cpf + '</td>' +
        '<td>' + nome + '</td>' +
        '<td>' +
        Operacoes(cpf) +
        '</td>' +
        '</tr>';

    $('#TableBeneficiario tbody').append(linha);
}

function AlterarBeneficiario(elem) {
    var tdCpf = $(elem).parents('tr').find('td:first-child');
    var tdNome = $(elem).parents('tr').find('td:nth-child(2)');
    var tdBotoes = $(elem).parents('tr').find('td:nth-child(3)');

    var cpf = $(tdCpf).text();
    var nome = $(tdNome).text();
    var pos = benefList.findIndex(b => b.CPF == cpf);

    $(tdCpf).html('<input type="text" class="form-control cpf" value="' + cpf + '" placeholder="Ex.: 123.456.789-10" />');
    $(tdNome).html('<input type="text" class="form-control" value="' + nome + '" placeholder="Ex.: João da Silva" />');
    $(tdBotoes).html(OperacoesEdicao(cpf, nome, pos));
    $("input.cpf").mask('000.000.000-00', { reverse: true });
}

function ExcluirBeneficiario(elem, cpf) {
    benefList = benefList.filter(b => b.CPF != cpf);
    $(elem).parents('tr').remove();
}

function SalvarAlteracaoBeneficiario(elem, cpf, pos) {
    var tdCpf = $(elem).parents('tr').find('td:first-child');
    var tdNome = $(elem).parents('tr').find('td:nth-child(2)');
    var tdBotoes = $(elem).parents('tr').find('td:nth-child(3)');

    var novoCpf = $(tdCpf).find('input').val();
    var novoNome = $(tdNome).find('input').val();

    if (novoCpf && novoNome) {
        $.ajax({
            url: urlValidaCpf,
            method: "POST",
            data: {
                "CPF": novoCpf
            },
            error:
                function (r) {
                    ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                },
            success:
                function (valid) {
                    if (valid) {
                        if (benefList.findIndex(b => b.CPF == cpf) < 0 || benefList.findIndex(b => b.CPF == cpf) == pos) {
                            benefList[pos]['Nome'] = novoNome;
                            benefList[pos]['CPF'] = novoCpf;

                            $(tdCpf).html(novoCpf);
                            $(tdNome).html(novoNome);
                            $(tdBotoes).html(Operacoes(novoCpf));
                        } else {
                            ModalDialog("Ocorreu um erro", "CPF duplicado na lista de beneficiários.");
                        }
                    } else {
                        ModalDialog("Ocorreu um erro", "CPF inválido.");
                    }
                }
        });
    } else {
        ModalDialog("Ocorreu um erro", "Todos os campos do beneficiário devem ser preenchidos.");
    }
}

function CancelarAlteracaoBeneficiario(elem, cpfAntigo, nomeAntigo) {
    $(elem).parents('tr').find('td:first-child').html(cpfAntigo);
    $(elem).parents('tr').find('td:nth-child(2)').html(nomeAntigo);
    $(elem).parents('tr').find('td:nth-child(3)').html(Operacoes(cpfAntigo));
}

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
        '        <div class="modal-dialog">                                                                                 ' +
        '            <div class="modal-content">                                                                            ' +
        '                <div class="modal-header">                                                                         ' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
        '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-body">                                                                           ' +
        '                    <p>' + texto + '</p>                                                                           ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-footer">                                                                         ' +
        '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
        '                                                                                                                   ' +
        '                </div>                                                                                             ' +
        '            </div><!-- /.modal-content -->                                                                         ' +
        '  </div><!-- /.modal-dialog -->                                                                                    ' +
        '</div> <!-- /.modal -->                                                                                        ';

    $('body').append(texto);
    $('#' + random).modal('show');
}
