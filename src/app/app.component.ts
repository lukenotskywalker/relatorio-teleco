import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'relatorio-teleco';
  text: string;
  isProcessando = false;
  isWaiting = true;
  hadError = false;
  hadDone = false;

  openFileManager() {
    document.getElementById('files').click();
  }

  async tratarfile(objeto) {
    //Verificações Primarias

    if (objeto.type != "text/plain")
      //To-Do Verificação de formato

      objeto = new Blob();
    this.hadError = false;
    this.hadDone = false;
    this.isProcessando = true;
    this.isWaiting = false;
    var text = await objeto.text();

    var jsonformat = this.convertToJSON(text);

    //Pego todos os telefones (distintos) de origem, seus ddds e calculo a média.
    //Depois, aproveito o objeto de telefones distintos para contagem de clientes.
    try {
      var telefonesOrigem = await this.contaTelefonesOrigem(jsonformat);
      var relacaoMediaDDD = await this.contaMediaDddDuracao(jsonformat);
      var contagemClientesDeOutroDDD = await this.contaRegistrosOutroDDD(jsonformat);
    } catch {
      this.hadError = true;
      this.isProcessando = false;
      this.isWaiting = true;
      return false;
    }
    var textfile = "TOTAL_CLIENTES_LIGARAM:" + telefonesOrigem + "\nDURACAO_MEDIA:"
    relacaoMediaDDD.forEach(e => {
      textfile += "\n  " + e.DDD + ": " + e.Media;
    });
    textfile += "\nTOTAL_CLIENTES_LIGARAM_OUTRO_DDD:" + contagemClientesDeOutroDDD;

    var archive = new Blob([textfile], { type: 'plain/text' });
    var name = "Relatório.txt";
    var objUrl = URL.createObjectURL(archive);
    var a = document.createElement('a') as HTMLAnchorElement;

    a.href = objUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(objUrl);


    var that = this;
    setTimeout(function () {
      that.isProcessando = false;
      that.isWaiting = true;
      that.hadDone = true;
    }, 500);
  }

  async contaRegistrosOutroDDD(object) {
    var distinctddd = object.filter(d => d.TelefoneOrigem.substring(0, 2) != d.TelefoneDestino.substring(0, 2));
    //Agora, filtro os duplicatas em um DDD e retorno a contagem.
    return new Set(distinctddd.map(x => x.TelefoneOrigem)).size;

  }

  async contaTelefonesOrigem(object) {
    return new Set(object.map(x => x.TelefoneOrigem)).size;
  }

  async contaMediaDddDuracao(object) {
    var ddsDeOrigem = new Set(object.map(x => x.TelefoneOrigem.substring(0, 2)));
    var relacaoDddMinuto = [];
    ddsDeOrigem.forEach(dd => {
      var relation = object.filter(r => r.TelefoneOrigem.substring(0, 2) == dd);
      var soma = 0;
      relation.forEach(re => {
        soma += +re.Duracao;
      });
      relacaoDddMinuto.push({ DDD: dd, Media: ~~(soma / relation.length) })
    });

    return relacaoDddMinuto;
  }

  convertToJSON(text) {

    var retorno = [];
    var linhas = text.split("\n");
    var colunas = linhas[0].split(";");

    for (var i = 1; i < linhas.length; i++) {

      var obj = {};
      var linhatual = linhas[i].split(";");

      for (var j = 0; j < colunas.length; j++) {
        obj[colunas[j].trim()] = linhatual[j];
      }
      retorno.push(obj);
    }
    return retorno;
  }
}

