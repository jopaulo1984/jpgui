JPGUI
=====

JPGUI é uma biblioteca que cria elementos e janelas para uma aplicação web. A ideia é utilizar o javascript da mesma forma que outras linguagens utilizam para criação de elementos GUI. 

Por exemplo, com a biblioteca é possível criar uma janela de diálogo facilemente. Veja no exemplo abaixo como criar um diálogo com botões 'Sim' e 'Não'.

```javascript
var mydialog = new JPDialog({
    title: "Meu Diálogo",
    buttons: [
        new JPButton({ text: "Sim" , result: ResponseResult.YES }),
        new JPButton({ text: "Não" , result: ResponseResult.NO })
    ]
});

mydialog.showModal(function (windialog, result) {
    // 'windialog' é a própria janela de diálogo. 'result' corresponde ao botão pressionado.
    if (result == ResponseResult.YES) {
        console.log("O botão 'Sim' foi clicado.");
    } else if (result == ResponseResult.NO) {
        console.log("O botão 'Não' foi clicado.");
    }
    windialog.destroy(); // destrói a janela.
});
```

Classe MyElement
----------------

