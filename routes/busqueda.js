var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//==============================================
// Busqueda por colección
//==============================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var coleccionValida = ['medico', 'usuario', 'hospital'];

    if (coleccionValida.includes(tabla.toLowerCase())) {

        if (tabla.toLowerCase() === 'usuario') {

            buscarUsuarios(busqueda, regex)
                .then(usuarios => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Peticion realizada correctamente - usuario',
                        usuarios: usuarios
                    })
                })
        }

        if (tabla.toLowerCase() === 'hospital') {
            buscarHospitales(busqueda, regex)
                .then(hospitales => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Peticion realizada correctamente - hospitales',
                        hospitales: hospitales
                    })
                })
        }

        if (tabla.toLowerCase() === 'medico') {
            buscarMedicos(busqueda, regex)
                .then(medicos => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Peticion realizada correctamente - medicos',
                        medicos: medicos
                    })
                })
        }

    } else {
        res.status(500).json({
            ok: false,
            mensaje: 'La coleccion de busqueda no existe'
        });
    }


});


//==============================================
// Busqueda General
//==============================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                resultado: 'ok',
                hopitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })

});



function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales)
                }

            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .populate('hospital', 'nombre img')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos');
                } else {
                    resolve(medicos)
                }

            });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email rol')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al buscar usuarios');
                } else {
                    resolve(usuarios);
                }

            });

    });

}
module.exports = app;