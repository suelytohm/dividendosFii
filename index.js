const express = require('express')
const request = require('request-promise')
const cheerio = require('cheerio')

const bodyParser = require('body-parser');
const mysql = require('mysql');



const app = express()
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let cotacao = "";

app.get("/fii/:fii", async (req, res) => {

    let nomeDoFii = req.params.fii
    nomeDoFii = nomeDoFii.toUpperCase();
    let div = await buscarDividendo(nomeDoFii)
    
    res.json({'fii': nomeDoFii,'dividendo': div,'cotacao': cotacao});

})

app.get('/fiis', (req, res) =>{
    execSQLQuery('SELECT * FROM fiis', res);
})

app.get('/fiis/:fii', (req, res) =>{
    let nomeDoFii = req.params.fii
    execSQLQuery("SELECT * FROM fiis where codigo like '" + nomeDoFii + "%'", res);
})


async function buscarDividendo(fii){
    try{
        fii = await validarFii(fii)
        const URL = "https://www.fundsexplorer.com.br/funds/" + fii
        const response = await request(URL)
        let $ = cheerio.load(response)
        let dividendo = $('.carousel-cell').first().next().text()
        cotacao = $('.price').first().text()


        dividendo = dividendo.substring(67, 71)
        dividendo = replaceAll(dividendo, ',', '.')

        cotacao = cotacao.substring(22, 50)
        cotacao = replaceAll(cotacao, '\n ', '')
        cotacao = replaceAll(cotacao, ',', '.')        
        cotacao = replaceAll(cotacao, ' ', '')

        
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
        // Buscar Código

        return nomeFii
    }else{
        return "erro"
    }
    
}


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}


app.listen(port, (erro) =>{
    if(!erro){
        console.log("Server rodando na porta 3000")
    }else{
        console.log(erro)
    }
})













function execSQLQuery(sqlQry, res){
    const connection = mysql.createConnection({
      host     : 'sql10.freemysqlhosting.net',
      port     : 3306,
      user     : 'sql10450242',
      password : 'uVxfyAa5ic',
      database : 'sql10450242'
    });
  
    connection.query(sqlQry, function(error, results, fields){
        if(error) 
          res.json(error);
        else
          res.json(results);
        connection.end();
        console.log('executou!');
    });
  }


