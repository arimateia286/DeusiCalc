const BANDEIRAS = ["Visa e Mastercard", "Elo, Hipercard e Amex"]
const FORMAS = ["Débito", "Crédito em 1x", "Crédito em 2x", "Crédito em 3x", "Crédito em 4x", "Crédito em 5x", "Crédito em 6x", "Crédito em 7x", "Crédito em 8x", "Crédito em 9x", "Crédito em 10x", "Crédito em 11x", "Crédito em 12x"]
const TIPOSTAXA = ["Cliente paga a taxa", "Vendedor paga a taxa"]
const DIGITOS = "123456789.0="

const FORMATADOR = new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
})

const data = new Date()

if (localStorage.getItem("tamanhoFonte") == null) {
    localStorage.setItem("tamanhoFonte", 1)
}

const tamanhosFonte = [["12pt", "20pt"], ["10pt", "18pt"]]
let tamanhoFonteAtual = localStorage.getItem("tamanhoFonte")

if (localStorage.getItem("temaAtual") == null) {
    localStorage.setItem("temaAtual", 0)
}

const temas = ["#01ff5f", "#00a5ff", "#ffa100", "#fdadff"]
let temaAtual = localStorage.getItem("temaAtual")

let taxas, valor = "0.00"

function inicio() {
    mudarFonte()
    let r = document.querySelector(":root")
    r.style.setProperty("--corFundo", temas[temaAtual])
    
    if (navigator.onLine) {
        (async () => {
            const taxasTemp = await axios.get("https://raw.githubusercontent.com/arimateia286/DeusiCalc/main/taxas.js")
            taxas = taxasTemp.data
            localStorage.setItem("taxasLocal", JSON.stringify(taxas))
            localStorage.setItem("dataTaxas", JSON.stringify(
                data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear() +
                " às " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds()
            ))
        })()
        taxas = JSON.parse(localStorage.getItem("taxasLocal"))
    } else {
        if (localStorage.getItem("taxasLocal") != null) {
            alert("Você está offline!\nTaxas baixadas em " + JSON.parse(localStorage.getItem("dataTaxas")))
            taxas = JSON.parse(localStorage.getItem("taxasLocal"))
        }
        else {
            alert("Você não tem a tabela de taxas baixada!\nConecte-se a internet para baixar a tabela mais recente e usar o aplicativo!")
        }
    }
    
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

    listaParcelamento = document.getElementById("listaParcelamento")

    let listaParcelametoTemp = ""
    for (let i = 0; i < FORMAS.length; i++) {
        if (i == 0) listaParcelametoTemp += "<div class='textoPopup'  style='border-top: solid 1px #000' onclick='parcelaAoClicar(" + i + ")'>" + FORMAS[i] + "</div>"
        else listaParcelametoTemp += "<div class='textoPopup' onclick='parcelaAoClicar(" + i + ")'>" + FORMAS[i] + "</div>"
    }
    listaParcelamento.innerHTML = listaParcelametoTemp

    botaoParcelamentoOk = document.getElementById("botaoParcelamentoOk")
    botaoParcelamentoOk.onclick = () => {
        telaParcelamento.close()
    }

    telaResultados = document.getElementById("telaResultados")

    divDigitos = document.getElementById("divDigitos")
    for (let i = 0; i < DIGITOS.length; i++) {
        let botao = document.createElement("button")
        botao.className = "botaoPreto botaoDigito"
        botao.innerHTML = DIGITOS[i]
        botao.onclick = () => {
            if (DIGITOS[i] == "=") {
                resultados = calcular(botaoBandeira.indice, botaoForma.indice, botaoTipoTaxa.indice, valor)
                telaResultados.innerHTML = `<div class='botaoPopup'>Concluído</div>
                <div class='textoPopup' style='border-top: solid 1px #000'>Taxa de: R$${resultados[1]} (${resultados[6]}%)</div>
                <div class='textoPopup'>Cliente paga: R$${resultados[2]}</div>
                <div class='textoPopup'>Parcelado em ${resultados[3]}x de R$${resultados[4]}</div>
                <div class='textoPopup' style='border-bottom: solid 1px #000'>Total a receber: R$${resultados[5]}</div>
                <div class='botaoPopup' onclick='botaoOkAoClicar();'>Ok</div>`
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
    
    botaoSobreOk = document.getElementById("botaoSobreOk")
    botaoSobreOk.onclick = () => {
        telaSobre.close()
    }
    
    botaoTamanhoFonte = document.getElementById("botaoTamanhoFonte")
    botaoTamanhoFonte.onclick = () => {
        if (tamanhoFonteAtual < 1) tamanhoFonteAtual++
        else tamanhoFonteAtual = 0
        localStorage.setItem("tamanhoFonte", tamanhoFonteAtual)
        mudarFonte()
    }
    
    statusConexao = document.getElementById("statusConexao")
    statusConexao.innerHTML = (navigator.onLine) ? "Online" : "Offline (" + JSON.parse(localStorage.getItem("dataTaxas")) + ")"
}

function mudarFonte() {
    let r = document.querySelector(":root")
    r.style.setProperty("--tamanhoFonteTexto", tamanhosFonte[0][tamanhoFonteAtual])
    r.style.setProperty("--tamanhoFonteBotao", tamanhosFonte[1][tamanhoFonteAtual])
    botaoTamanhoFonte.innerHTML = (tamanhoFonteAtual == 0) ? "Tamanho da fonte: Pequena" : "Tamanho da fonte: Grande"
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

function miau() {
    alert("She diz: 'Miau, krl, vou mudar esse tema!'")
    if (temaAtual < temas.length - 1) temaAtual++
    else temaAtual = 0
    localStorage.setItem("temaAtual", temaAtual)
    let r = document.querySelector(":root")
    r.style.setProperty("--corFundo", temas[temaAtual])
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