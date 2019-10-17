import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'relatorio-teleco';
  text: string;
  bool_enviado = false;

  async tratarfile(objeto) {
    //Verificações Primarias

    if(objeto.type != "text/plain")
      //To-Do Verificação de formato

    objeto = new Blob();
    this.bool_enviado = false;
    var text = await objeto.text();

    var jsonformat = this.convertToJSON(text);

    var telefonesOrigem = new Set(jsonformat.map(x => x.TelefoneOrigem));
    
    for (var i = 0; i < telefonesOrigem.)

    debugger;
  }

  convertToJSON (csv) {

    var retorno = [];
    var linhas = csv.split("\n");
    var colunas = linhas[0].split(";");

    for (var i = 1; i < linhas.length; i++) {

        var obj = {};
        var linhatual = linhas[i].split(";");

        for (var j = 0; j < colunas.length; j++) {
            obj[colunas[j]] = linhatual[j];
        }
        retorno.push(obj);
    }
    return retorno; 
  }
}

