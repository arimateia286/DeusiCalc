const BANDEIRAS = ["Visa e Mastercard", "Elo, Hipercard e Amex"]
const FORMAS = ["Débito", "Crédito em 1x", "Crédito em 2x", "Crédito em 3x", "Crédito em 4x", "Crédito em 5x", "Crédito em 6x", "Crédito em 7x", "Crédito em 8x", "Crédito em 9x", "Crédito em 10x", "Crédito em 11x", "Crédito em 12x"]
const TIPOSTAXA = ["Cliente paga a taxa", "Vendedor paga a taxa"]
const DIGITOS = "123456789.0="

const FORMATADOR = new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
})

let taxas, valor = "0.00"

function inicio() {
    (async () => {
        const taxasTemp = await axios.get("https://raw.githubusercontent.com/arimateia286/DeusiCalc/main/taxas.js")
        taxas = taxasTemp.data
    })()

    botaoBandeira = new botaoSwitch("botaoBandeira", BANDEIRAS)
    botaoForma = new botaoSwitch("botaoForma", FORMAS)
    botaoForma.botao.onclick = () => {
        telaParcelamento.showModal()
    }
    botaoTipoTaxa = new botaoSwitch("botaoTipoTaxa", TIPOSTAXA)

    visor = document.getElementById("visor")
    visor.innerHTML = valor

    botaoLimpar = document.getElementById("botaoLimpar")
    botaoLimpar.onclick = () => {
        if (valor.length > 1 && valor != "0.00") {
            valor = valor.slice(0, valor.length - 1)
        } else if (valor.length == 1) {
            valor = "0.00"
        }
        visor.innerHTML = valor
    }

    telaParcelamento = document.getElementById("telaParcelamento")

    let telaParcelamentoTemp = "<div class='botaoPopup'>Parcelameto</div>"
    for (let i = 0; i < FORMAS.length; i++) {
        telaParcelamentoTemp += "<div class='textoPopup' onclick='parcelaAoClicar(" + i + ");'>" + FORMAS[i] + "</div>"
    }
    telaParcelamento.innerHTML = telaParcelamentoTemp

    telaResultados = document.getElementById("telaResultados")

    divDigitos = document.getElementById("divDigitos")
    for (let i = 0; i < DIGITOS.length; i++) {
        let botao = document.createElement("button")
        botao.className = "botaoDigito"
        botao.innerHTML = DIGITOS[i]
        botao.onclick = () => {
            if (DIGITOS[i] == "=") {
                resultados = calcular(botaoBandeira.indice, botaoForma.indice, botaoTipoTaxa.indice, valor)
                telaResultados.innerHTML = "<div class='botaoPopup'>Concluído" +
                    "</div><div class='textoPopup'>Taxa de: R$" + resultados[1] + " (" + resultados[6] + "%)" +
                    "</div><div class='textoPopup'>Cliente paga: R$" + resultados[2] +
                    "</div><div class='textoPopup'>Parcelado em " + resultados[3] + "x de R$" + resultados[4] +
                    "</div><div class='textoPopup' style='border-style: none'>Total a receber: R$" + resultados[5] +
                    "</div><div class='botaoPopup' onclick='botaoOkAoClicar();'>Ok</div>"
                telaResultados.showModal()
            } else {
                if (valor == "0.00") valor = ""
                valor += DIGITOS[i]
                visor.innerHTML = valor
            }
        }
        divDigitos.appendChild(botao)
    }

    telaSobre = document.getElementById("telaSobre")
    telaSobre.onclick = () => {
        telaSobre.close()
    }
}

function mostrarSobre() {
    imgSheIs = document.getElementById("imgSheIs")
    if (botaoForma.indice > 0) imgSheIs.src = "sheIs/1.png"
    else imgSheIs.src = "sheIs/0.png"
    telaSobre.showModal()
}

function parcelaAoClicar(indice) {
    botaoForma.indice = indice
    botaoForma.atualizar()
    telaParcelamento.close()
}

function botaoOkAoClicar() {
    telaResultados.close()
}

function botaoSwitch(idBotao, opcoes) {
    this.botao = document.getElementById(idBotao)
    this.opcoes = opcoes
    this.indice = 0

    this.botao.onclick = () => {
        if (this.indice < this.opcoes.length - 1) this.indice++
        else this.indice = 0
        this.atualizar()
    }

    this.atualizar = () => {
        this.botao.innerHTML = this.opcoes[this.indice]
    }
}

function calcular(bandeira, parcelamento_, tipoTaxa, valor) {
    let taxa, valorFinal, parcela, taxaPaga, parcelamento

    taxa = taxas[bandeira][parcelamento_]

    if (parcelamento_ == 0) parcelamento = 1
    else parcelamento = parcelamento_

    if (tipoTaxa == 0) {
        valorFinal = valor * 100 / (100 - taxa)
        parcela = valorFinal / parcelamento
        taxaPaga = valorFinal - valor
    } else {
        taxaPaga = valor * taxa / 100
        valorFinal = valor - taxaPaga
        parcela = valor / parcelamento
    }

    let resultadosTemp
    if (tipoTaxa == 0) resultadosTemp = [tipoTaxa, taxaPaga, valorFinal, parcelamento, parcela, valor, taxa]
    else resultadosTemp = [tipoTaxa, taxaPaga, valor, parcelamento, parcela, valorFinal, taxa]

    let resultados = []
    for (let i = 0; i < resultadosTemp.length; i++) {
        if (i != 3) resultados[i] = FORMATADOR.format(resultadosTemp[i])
        else resultados[i] = resultadosTemp[i]
    }

    return resultados
}