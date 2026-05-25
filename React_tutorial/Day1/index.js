const h4=React.createElement('h4',{'className': 'my-h4'},
    React.createElement('i',{'className': 'my-i'},'This is First Day of React Tutorial'),
    React.createElement('div',{'className': 'formConatiner'},React.createElement(
        'form',
        {'className': 'myform'},
        [
            React.createElement('div',{'className': 'field-set','id': 'field-set',},
                React.createElement('label',{'className': 'labelForname','htmlFor': 'name'},'Name'),
                React.createElement('input',{'type': 'text','placeholder': 'Enter Your Name','className': 'my-input','id': 'name','autoComplete': 'off'}),
            ),

            React.createElement('div',{'className': 'field-set','id': 'field-set',},
                React.createElement('label',{'className': 'labelForname','htmlFor': 'email'},'Email'),
                React.createElement('input',{'type': 'email','placeholder': 'Enter Your Email','className': 'my-input','id': 'email','autoComplete': 'off'}),
            ),

            React.createElement('div',{'className': 'field-set','id': 'field-set',},
                React.createElement('label',{'className': 'labelForname','htmlFor': 'password'},'Password'),
                React.createElement('input',{'type': 'password','placeholder': 'Enter Your Password','className': 'my-input','id': 'password','autoComplete': 'off'}),
            ),
            React.createElement('button',{'type': 'submit','className': 'my-button'},'Submit'),
        ]
    )),
);
const root=ReactDOM.createRoot(document.querySelector('#root'));

root.render(h4);
