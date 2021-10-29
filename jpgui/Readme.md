## JPGUI

JPGUI é uma biblioteca que cria elementos e janelas para uma aplicação web. A ideia é utilizar o javascript da mesma forma que outras linguagens utilizam para criação de elementos GUI.

#### Uso

Para utilizar, baixe os arquivos 'jpgui.js' e 'jpgui.css' para o seu projeto e depois os referencie no documento html.

```html
<html>
<head>
    ...
    <link rel="stylesheet" href="jpgui.css" /> 
    <script src="jpgui.js"></script>
</head>
<body>
    ...
</body>
</html>
```

Por exemplo, com a biblioteca é possível criar uma janela de diálogo facilmente. Veja no exemplo abaixo como criar um diálogo com botões 'Sim' e 'Não'.

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

#### Classe MyElement
```javascript
/**
 * @param {string} tag: nome da tag html.
 * @param {object} props: propriedades do elemento.
 */
constructor MyElement(tag, props={})
```

É a classe pai de todos os elementos da biblioteca. Ela herda de DOMElement. Com ela, qualquer elemento html pode ser gerado.
As propriedades do objeto podem ser definidas no momento da instaciação ou através do método `setProperties()`.

Ex.:
```javascript
var myform = document.getElementById("form-teste");

// definido as propriedades na instanciação do objeto
var usremail = new MyElement("input", {
    parent: myform,
    name: "email",
    type: "email",
    placeholder: "email@email.com",
    required: true
});

// definido as propriedades após instanciação do objeto
var pass = new MyElement("input");
pass.setProperties({
    parent: myform,
    name: "pass",
    type: "password",
    placeholder: "Senha",
    required: true
});
```

#### Propriedade `parent`
A propriedade `parent` indica o elemento pai onde o elemento instanciado será inserido. Também pode usar a função `setParent()` ou o atributo `parent` do elemento instanciado ou a função herdada do DOM `appendChild()` do elemento pai.

Ex.:
```javascript
// formas de definir parent
var usremail = new MyElement("input", {parent: myform, type: "email"});
// ou
usremail.setProperties({parent: myform});
// ou
usremail.setParent(myform);
// ou
usremail.parent = myform;
// ou
myform.appendChild(usremail);
```

#### Classe JPInput
`constructor JPPanel(props={})`

A classe JPInput implementa elementos quem servem para entrada de dados. Ela implementa os `<input />` do html. Além dos inputs normais do HTML, ela também implementa dois tipos de inputs personalizados: `select` e `currency`;

Ex.:
```javascript
var usremail = new JPInput({parent: myform, type: "email"});
```

### Containers

#### Classe JPPanel
`constructor JPPanel(props={})`

A classe JPPanel implementa um painel que contém vários elementos. A ordem que os elementos aparecem será a de inserção no painel.

Ex.:
```javascript

```

