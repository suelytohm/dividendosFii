const express = require('express')
const request = require('request-promise')
const cheerio = require('cheerio')


const app = express()
let cotacao = "";


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

app.get("/:fii", async (req, res) => {
    let nomeDoFii = req.params.fii
    nomeDoFii = nomeDoFii.toUpperCase();

    let div = await buscarDividendo(nomeDoFii)
    cotacao = replaceAll(cotacao, ' ', '')
    cotacao = cotacao.replace(',', '.')
    div = div.replace(',', '.')


    
    res.json(
        { 
            'fii': nomeDoFii,
            'dividendo': div,
            'cotacao': cotacao
        }
    )
})

async function buscarDividendo(fii){
    try{
        fii = await validarFii(fii)
        const URL = "https://www.fundsexplorer.com.br/funds/" + fii
        const response = await request(URL)
        let $ = cheerio.load(response)
        let dividendo = $('.carousel-cell').first().next().text()
        cotacao = $('.price').first().text()

        //let valor = $('#quotation')

        //console.log(dividendo)
        dividendo = dividendo.substring(67, 71)
        cotacao = cotacao.substring(22, 50)
        cotacao = cotacao.replace('\n ', '')
        cotacao = cotacao.replace(' ', '')

        
        console.log(`Dividendos ${fii}: R$ ${dividendo} - Cotação: ${cotacao} `)
        return dividendo
    }catch(erro){
        return null;
    }

}


function validarFii(nomeFii){
    nomeFii = nomeFii.toUpperCase();
    nomeFii = nomeFii.substring(0,6)
    
    if(nomeFii.substring(4,6) == "11"){
        
    }else{
        return "erro"
    }
    
    console.log(nomeFii)
    return nomeFii
}

app.listen(3000, (erro) =>{
    if(!erro){
        console.log("Server rodando na porta 3000")
    }else{
        console.log(erro)
    }
})