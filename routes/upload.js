var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['usuarios', 'hospitales', 'medicos'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El tipo no es válido. Debe ser usuarios, medicos, hospitales'
        });
    }



    if (!req.files)
        return res.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado ningún fichero.'
        });

    // Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones aceptadas para subir ficheros
    var extensionesValidas = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];

    //Validamos la extensión del fichero
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No es valida la extensión del fichero.'
        });
    }

    // Preparamos un nombre de archivo personalizado
    // {id_coleccion}-{random}.{extension}
    var nombreArchivo = `${id}-${new Date().getMilliseconds() }.${extensionArchivo}`;

    //Movemos el archivo a un path temporal
    var path = `./uploads/img/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el fichero.',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });
});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!Usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario no existe'
                });
            }


            var pathViejo = './uploads/img/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del médico'
                    });
                }

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!Medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El médico no existe'
                });
            }


            var pathViejo = './uploads/img/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Erro al actualizar la imagen del médico'
                    });
                }

                return res.status(200).json({
                    ok: true,
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!Hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital no existe'
                });
            }

            var pathViejo = './uploads/img/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Erro al actualizar la imagen del médico'
                    });
                }

                return res.status(200).json({
                    ok: true,
                    hospital: hospitalActualizado
                });
            });
        });
    }


};

module.exports = app;