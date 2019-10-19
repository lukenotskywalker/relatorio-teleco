import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Relatório diário de Clientes';
  Processando = false;
  Waiting = true;
  Error = false;
  Done = false;

  openFileManager() {
    document.getElementById('files').click();
  }

  async tratarfile(objeto) {

    //Variaveis de controle
    objeto = new Blob();
    this.Error = false;
    this.Done = false;
    this.Processando = true;
    this.Waiting = false;
    var text = await objeto.text();

    //Conversão do arquivo para o objeto
    var objFormatado = this.converterObjeto(text);

    //Coleciono os dados para criar o documento.
    try {
      var telefonesOrigem = await this.contaTelefonesOrigem(objFormatado);
      var relacaoMediaDDD = await this.contaMediaDddDuracao(objFormatado);
      var contagemClientesDeOutroDDD = await this.contaRegistrosOutroDDD(objFormatado);
    } catch {
      this.Error = true;
      this.Processando = false;
      this.Waiting = true;
      return false;
    }

    //Crio o documento e faço o download do mesmo.
    var ArqRetorno = "TOTAL_CLIENTES_LIGARAM:" + telefonesOrigem + "\nDURACAO_MEDIA:"
    relacaoMediaDDD.forEach(e => {
      ArqRetorno += "\n  " + e.DDD + ": " + e.Media;
    });
    ArqRetorno += "\nTOTAL_CLIENTES_LIGARAM_OUTRO_DDD:" + contagemClientesDeOutroDDD;

    var arq = new Blob([ArqRetorno], { type: 'plain/text' });
    var nome = "Relatório.txt";
    var objUrl = URL.createObjectURL(arq);
    var a = document.createElement('a') as HTMLAnchorElement;

    a.href = objUrl;
    a.download = nome;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(objUrl);

    // timeout de 0,5 segundos para baixar e exibir o aviso de completo.
    var that = this;
    setTimeout(function () {
      that.Processando = false;
      that.Waiting = true;
      that.Done = true;
    }, 500);
  }

  async contaRegistrosOutroDDD(object) {
    //Crio um Set com os DDDs existentes e retorno a contagem.
    return new Set(object.map(x => x.TelefoneOrigem.substring(0, 2))).size;

  }

  async contaTelefonesOrigem(object) {
    //Crio um Set com os telefones de origem e retorno a contagem.
    return new Set(object.map(x => x.TelefoneOrigem)).size;
  }

  async contaMediaDddDuracao(object) {
    //Reuno os DDDs para um foreach
    var ddsDeOrigem = Array.from(new Set(object.map(x => x.TelefoneOrigem.substring(0, 2)))).sort();
    var relacaoDddMinuto = [];
    ddsDeOrigem.forEach(dd => {
      //Seleciono os objetos que possuem esse DDD para telefone de origem e crio o objeto com o DDD e a média de segundos desse DDD
      var relation = object.filter(r => r.TelefoneOrigem.substring(0, 2) == dd);
      var soma = 0;
      relation.forEach(re => {
        soma += +re.Duracao;
      });
      relacaoDddMinuto.push({ DDD: dd, Media: ~~(soma / relation.length) })
    });

    return relacaoDddMinuto;
  }

  converterObjeto(text) {

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

