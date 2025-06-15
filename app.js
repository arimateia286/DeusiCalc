const BANDEIRAS = ["Visa e Master", "Elo e demais"];
const FORMAS = ["Débito", "Crédito em 1x", "Crédito em 2x", "Crédito em 3x", "Crédito em 4x", "Crédito em 5x", "Crédito em 6x", "Crédito em 7x", "Crédito em 8x", "Crédito em 9x", "Crédito em 10x", "Crédito em 11x", "Crédito em 12x"];
const TIPOSTAXA = ["Cliente paga a taxa", "Vendedor paga a taxa"];
const DIGITOS = "123456789.0=";

const FORMATADOR = new Intl.NumberFormat('pt-BR', {
	style: 'decimal',
	maximumFractionDigits: 2,
	minimumFractionDigits: 2,
});

const data = new Date();

let todasTaxas, taxas, valor = "0.00";

if (navigator.onLine) {
	(async () => {
		const taxasTemp = await axios.get("https://raw.githubusercontent.com/arimateia286/DeusiCalc/main/taxas.json");
		todasTaxas = taxasTemp.data;
		localStorage.setItem("taxasLocal", JSON.stringify(todasTaxas));
		const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
			dateStyle: 'short',
			timeStyle: 'medium'
		}).format(data);
		localStorage.setItem("dataTaxas", JSON.stringify(dataFormatada));
	})();
	todasTaxas = JSON.parse(localStorage.getItem("taxasLocal"));
} else {
	if (localStorage.getItem("taxasLocal") != null) {
		alert("Você está offline!\nTaxas baixadas em " + JSON.parse(localStorage.getItem("dataTaxas")));
		todasTaxas = JSON.parse(localStorage.getItem("taxasLocal"));
	}
	else {
		alert("Você não tem a tabela de taxas baixada!\nConecte-se a internet para baixar a tabela mais recente e usar o aplicativo!");
	}
}

let maquinaAtual = "Ton";

const telaSelecaoMaquina = document.getElementById("telaSelecaoMaquina");
telaSelecaoMaquina.showModal();

const botaoMaquinaPagBank = document.getElementById("maquinaPagBank");
botaoMaquinaPagBank.addEventListener("click", () => {
	maquinaAtual = "PagBank";
	taxas = todasTaxas[maquinaAtual];
	telaSelecaoMaquina.close();
	mudarEstilo();
});

const botaoMaquinaTon = document.getElementById("maquinaTon");
botaoMaquinaTon.addEventListener("click", () => {
	maquinaAtual = "Ton";
	taxas = todasTaxas[maquinaAtual];
	telaSelecaoMaquina.close();
	mudarEstilo();
});

const botaoBandeira = new botaoSwitch("botaoBandeira", BANDEIRAS);
const botaoForma = new botaoSwitch("botaoForma", FORMAS);
botaoForma.botao.onclick = () => {
	telaParcelamento.showModal();
}
const botaoTipoTaxa = new botaoSwitch("botaoTipoTaxa", TIPOSTAXA);

const visor = document.getElementById("visor");
visor.innerHTML = valor;

const botaoLimpar = document.getElementById("botaoLimpar");
botaoLimpar.onclick = () => {
	if (valor.length > 1 && valor != "0.00") {
		valor = valor.slice(0, valor.length - 1);
	} else if (valor.length == 1) {
		valor = "0.00";
	}
	visor.innerHTML = valor;
}

const telaParcelamento = document.getElementById("telaParcelamento");

const listaParcelamento = document.getElementById("listaParcelamento");

let listaParcelametoTemp = ""
for (let i = 0; i < FORMAS.length; i++) {
	if (i == 0) listaParcelametoTemp += "<div class='textoPopup'  style='border-top: solid 1px #000' onclick='parcelaAoClicar(" + i + ")'>" + FORMAS[i] + "</div>";
	else listaParcelametoTemp += "<div class='textoPopup' onclick='parcelaAoClicar(" + i + ")'>" + FORMAS[i] + "</div>";
}
listaParcelamento.innerHTML = listaParcelametoTemp;

const botaoParcelamentoOk = document.getElementById("botaoParcelamentoOk");
botaoParcelamentoOk.onclick = () => {
	telaParcelamento.close();
}

const telaResultados = document.getElementById("telaResultados");

const divDigitos = document.getElementById("divDigitos");
for (let i = 0; i < DIGITOS.length; i++) {
	let botao = document.createElement("button");
	botao.className = "botaoPreto botaoDigito";
	botao.innerHTML = DIGITOS[i];
	botao.onclick = () => {
		if (DIGITOS[i] == "=") {
			mostrarResultados();
		} else {
			if (valor == "0.00") valor = "";
			valor += DIGITOS[i];
			visor.innerHTML = valor;
		}
	}
	divDigitos.appendChild(botao);
}

const telaSobre = document.getElementById("telaSobre");

const botaoSobreOk = document.getElementById("botaoSobreOk");
botaoSobreOk.onclick = () => {
	telaSobre.close();
}

const statusConexao = document.getElementById("statusConexao");
statusConexao.innerHTML = (navigator.onLine) ? "Online" : "Offline (" + JSON.parse(localStorage.getItem("dataTaxas")) + ")";

function mudarEstilo() {
	const mainContainer = document.querySelector(".mainContainer");
	mainContainer.className = "mainContainer tema" + maquinaAtual;
	let telasPopup = document.getElementsByClassName("telaPopup");
	telasPopup = Array.from(telasPopup);
	telasPopup.forEach(tela => {
		tela.className = "telaPopup telaPopup tema" + maquinaAtual;
	});
}

function mostrarResultados() {
	let resultados = calcular(botaoBandeira.indice, botaoForma.indice, botaoTipoTaxa.indice, valor);
	telaResultados.innerHTML = `<div class='botaoPopup'>Concluído</div>
        <div class='textoPopup'>Taxa de:<br><strong class='resultadoGrande'>R$${resultados[1]} (${resultados[6]}%)</strong></div>
        <div class='textoPopup'>Passar na máquina:<br><strong class='resultadoGrande'>R$${resultados[2]}</strong></div>
        <div class='textoPopup'>Parcelado em:<br><strong class='resultadoGrande'>${resultados[3]}x de R$${resultados[4]}</strong></div>
        <div class='textoPopup'>Você recebe:<br><strong class='resultadoGrande'>R$${resultados[5]}</strong></div>
        <div class='botaoPopup' onclick='botaoOkAoClicar();'>Ok</div>`;
	telaResultados.showModal();
}

function mostrarSobre() {
	imgSheIs = document.getElementById("imgSheIs");
	if (botaoForma.indice > 0) imgSheIs.src = "sheIs/1.png";
	else imgSheIs.src = "sheIs/0.png";
	telaSobre.showModal();
}

function mostrarSelecaoMaquina() {
	telaSelecaoMaquina.showModal();
}

function parcelaAoClicar(indice) {
	botaoForma.indice = indice;
	botaoForma.atualizar();
	telaParcelamento.close();
}

function botaoOkAoClicar() {
	telaResultados.close();
}

function miau() {
	alert("She diz: 'Miau, krl!'");
}

function calcular(bandeira, parcelamento_, tipoTaxa, valor) {
	let taxa, valorFinal, parcela, taxaPaga, parcelamento;

	taxa = taxas[bandeira][parcelamento_];

	if (parcelamento_ == 0) parcelamento = 1;
	else parcelamento = parcelamento_;

	if (tipoTaxa == 0) {
		valorFinal = valor * 100 / (100 - taxa);
		parcela = valorFinal / parcelamento;
		taxaPaga = valorFinal - valor;
	} else {
		taxaPaga = valor * taxa / 100;
		valorFinal = valor - taxaPaga;
		parcela = valor / parcelamento;
	}

	let resultadosTemp;
	if (tipoTaxa == 0) resultadosTemp = [tipoTaxa, taxaPaga, valorFinal, parcelamento, parcela, valor, taxa];
	else resultadosTemp = [tipoTaxa, taxaPaga, valor, parcelamento, parcela, valorFinal, taxa];

	let resultados = [];
	for (let i = 0; i < resultadosTemp.length; i++) {
		if (i != 3) resultados[i] = FORMATADOR.format(resultadosTemp[i]);
		else resultados[i] = resultadosTemp[i];
	}

	return resultados;
}

function botaoSwitch(idBotao, opcoes) {
	this.botao = document.getElementById(idBotao);
	this.opcoes = opcoes;
	this.indice = 0;

	this.botao.onclick = () => {
		if (this.indice < this.opcoes.length - 1) this.indice++;
		else this.indice = 0;
		this.atualizar();
	}

	this.atualizar = () => {
		this.botao.innerHTML = this.opcoes[this.indice];
	}
}

window.addEventListener("keydown", (event) => {
	if (event.key == "Enter") {
		mostrarResultados();
	} else if (!isNaN(event.key) && DIGITOS.includes(event.key) || event.key == ".") {
		if (valor == "0.00") valor = "";
		valor += event.key;
		visor.innerHTML = valor;
	} else if (event.key == "Backspace") {
		if (valor.length > 1 && valor != "0.00") {
			valor = valor.slice(0, valor.length - 1);
		} else if (valor.length == 1) {
			valor = "0.00";
		}
		visor.innerHTML = valor;
	}
});