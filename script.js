const localizacoes = [
    { id: 1, nome: "Shopping Center Norte", lat: -23.515825, lon: -46.616413, vegetacao: Math.round(Math.random()*25)+1, status: '' },
    { id: 2, nome: "Shopping Metro Tucuruvi", lat: -23.480308, lon: -46.602511, vegetacao: Math.round(Math.random()*25)+1, status: '' },
    { id: 3, nome: "Shopping Aricanduva", lat: -23.564331, lon: -46.503986, vegetacao: Math.round(Math.random()*25)+1, status: ''  },
    { id: 4, nome: "Shopping Interlagos", lat: -23.674497, lon: -46.678274, vegetacao: Math.round(Math.random()*25)+1, status: ''  },
    { id: 5, nome: "Shopping Metro Tatuapé", lat: -23.541209, lon: -46.577364, vegetacao: Math.round(Math.random()*25)+1, status: '' },
    { id: 6, nome: "Shopping Bourbon", lat: -23.525671, lon: -46.681057, vegetacao: Math.round(Math.random()*25)+1, status: '' },
    { id: 7, nome: "Shopping Cidade São Paulo", lat: -23.564240, lon: -46.653020, vegetacao: Math.round(Math.random()*25)+1, status: '' },
    { id: 8, nome: "Shopping Pátio Higienópolis", lat: -23.542775, lon: -46.658146, vegetacao: Math.round(Math.random()*25)+1, status: '' },
    { id: 9, nome: "Shopping Eldorado", lat: -23.571682, lon: -46.696190, vegetacao: Math.round(Math.random()*25)+1, status: ''  },
    { id: 10, nome: "Shopping Villa Lobos", lat: -23.551912, lon: -46.722544, vegetacao: Math.round(Math.random()*25)+1, status: '' }
]

const ordenandoLocalizacoes = ()=>{
    localizacoes.sort((a, b) => b.vegetacao - a.vegetacao)
}

const btn = document.querySelector('#btn-aleatorio')

const map = L.map('map').setView([-23.542089, -46.634757], 11)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

const mapMarkers = {};

btn.addEventListener('click', ()=>{
    localizacoes.forEach((localizacao) => {
        let crescimento = Math.round(Math.random() * 7) + 1
        localizacao.vegetacao += crescimento
    })
    const container = document.getElementById('container-cards')
    if(container){
        container.innerHTML="<h3>Unidades em foco</h3>"
    }
    pegandoApiMeteorologica()
})


const definindoStatus = (posicao) =>{
    const altura = localizacoes[posicao].vegetacao
    if(altura<15){
        localizacoes[posicao].status = 'Normal'
        return
    }
    if(altura<25){
        localizacoes[posicao].status = 'Atenção'
        return
    }
    localizacoes[posicao].status = 'Crítico'
}

const corStatus  = (status)=>{
    let cor
    if(status === 'Normal'){
        cor = '#2ecc71'
        return cor
    }
    if(status === 'Atenção'){
        cor = '#ba8e23'
        return cor
    }
    cor ='#e74c3c'
    return cor
}

const acaoRecomendada = (status)=>{
    let acao
    if(status === 'Normal'){
        acao = 'Continuar monitorando'
        return acao
    }
    if(status === 'Atenção'){
        acao = 'Cortar a grama'
        return acao
    }
    acao ='Cortar a grama IMEDIATAMANTE'
    return acao
}

const iconeEscolhido = (status, cor)=>{
    let icone
    if(status === 'Normal'){
        icone = `<i class="fa-solid fa-eye" style="color:${cor}"></i>`
        return icone
    }
    if(status === 'Atenção'){
        icone = `<i class="fa-solid fa-scissors" style="color:${cor}"></i>`
        return icone
    }
    icone =`<i class="fa-solid fa-triangle-exclamation" style="color:${cor}"></i>`
    return icone
}

async function pegandoApiMeteorologica() {
    const container = document.getElementById('container-cards')
    container.innerHTML="<h3>Unidades em foco</h3>"

    ordenandoLocalizacoes()

    let totalTemperatura = 0
    let totalVento = 0
    let totalChuva = 0
    let totalUmidade = 0
    
    for (let i = 0; i < localizacoes.length; i++) {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${localizacoes[i].lat}&longitude=${localizacoes[i].lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`)
            const data = await response.json()
            
            const informacoesClima = data.current
            const temperatura = informacoesClima.temperature_2m
            const umidade = informacoesClima.relative_humidity_2m
            const vento = informacoesClima.wind_speed_10m
            const chuva = informacoesClima.precipitation

            definindoStatus(i)
            const cor = corStatus(localizacoes[i].status)
            const acao = acaoRecomendada(localizacoes[i].status)
            const icone = iconeEscolhido(localizacoes[i].status, cor)
            
            const card = document.createElement('div')
            card.className = 'localizacao-card'
            card.innerHTML = `
                <div class="localizacao-info-header">
                    <span class="localizacao-nome">${localizacoes[i].nome}</span>
                </div>
                <div class="clima-container">
                    <div class="clima-item">
                        <i class="fa-solid fa-temperature-high"></i> 
                        <span class="clima-value">${temperatura} °C</span>
                    </div>
                    <div class="clima-item">
                        <i class="fa-solid fa-droplet"></i>
                        <span class="clima-value">${umidade}%</span>
                    </div>
                    <div class="clima-item">
                        <i class="fa-solid fa-wind"></i>
                        <span class="clima-value">${vento} km/h</span>
                    </div>
                    <div class="clima-item">
                        <i class="fa-solid fa-cloud-showers-heavy"></i>
                        <span class="clima-value">${chuva} mm</span>
                    </div>
                </div>
                <div class="vegetacao">
                    <p> <i class="fa-solid fa-ruler-vertical"></i> Altura da vegetação: ${localizacoes[i].vegetacao} cm</p>
                    <p style="color:${cor}"> <i class="fa-solid fa-circle"></i> Status: ${localizacoes[i].status}</p>
                    <p> ${icone} Ação recomendada: ${acao}</p>
                </div>
            `

            card.addEventListener('click', () => {
                map.setView([localizacoes[i].lat, localizacoes[i].lon], 11)
                mapMarkers[localizacoes[i].id].openPopup()
            })

            if (container) {
                container.appendChild(card)
            }

            const iconeCustomizado = L.divIcon({
                html: `<i class="fa-solid fa-location-dot"></i>`,
                className: 'custom-marker', 
                iconSize: [30, 42],         
                iconAnchor: [15, 42],       
                popupAnchor: [0, -40]      
            })

            const marker = L.marker([localizacoes[i].lat, localizacoes[i].lon], { icon: iconeCustomizado })
                .addTo(map)
                .bindPopup(`
                    <strong>${localizacoes[i].nome}</strong><br>
                    Temp: ${temperatura}°C | Umidade: ${umidade}%<br>  Vento: ${vento} km/h | Chuva: ${chuva} mm
                `)
                    
            mapMarkers[localizacoes[i].id] = marker
            totalTemperatura += temperatura
            totalChuva += chuva
            totalVento += vento
            totalUmidade+= umidade
        } catch (error) {
            console.error("Falha ao coletar dados para a localidade:", localizacoes[i].nome, error)
        }
    }

    const mediaTemperatura = totalTemperatura / localizacoes.length
    const mediaVento = totalVento / localizacoes.length
    const mediaChuva = totalChuva / localizacoes.length
    const mediaUmidade = totalUmidade / localizacoes.length

    document.querySelector('#temperatura').textContent = `${mediaTemperatura.toFixed(2)} ºC`
    document.querySelector('#precipitacao').textContent = `${mediaChuva.toFixed(2)} mm`
    document.querySelector('#vento-velocidade').textContent = `${mediaVento.toFixed(2)} km/h`
    document.querySelector('#umidade-ar').textContent = `${mediaUmidade.toFixed(2)}%`
}

window.onload = pegandoApiMeteorologica