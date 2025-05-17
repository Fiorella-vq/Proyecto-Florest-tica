from flask import Blueprint, request, jsonify, current_app
from api.models import db, Reserva
from flask_cors import CORS
from datetime import datetime
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

api = Blueprint('api', __name__)
CORS(api, supports_credentials=True)

def generate_token(length=32):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def enviar_email_smtp(email_destino, asunto, mensaje):
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USERNAME')
    smtp_pass = os.getenv('SMTP_PASSWORD')
    sender = os.getenv('ADMIN_EMAIL', smtp_user)

    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = email_destino
    msg['Subject'] = asunto
    msg.attach(MIMEText(mensaje, 'plain'))

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(sender, email_destino, msg.as_string())
        server.quit()
        return True, "Correo enviado"
    except Exception as e:
        return False, str(e)

@api.route("/reservas", methods=["POST"])
def crear_reserva():
    data = request.json
    if not data:
        return jsonify({'error': 'No se recibió JSON válido'}), 400

    fecha_str = data.get('fecha')
    hora = data.get('hora')
    email = data.get('email')
    nombre = data.get('nombre')
    telefono = data.get('telefono')
    servicio = data.get('servicio', 'Servicio')

    if not (fecha_str and hora and email and nombre and telefono):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido, debe ser YYYY-MM-DD'}), 400

    try:
        datetime.strptime(hora, '%H:%M')
    except ValueError:
        return jsonify({'error': 'Formato de hora inválido, debe ser HH:MM'}), 400

    reserva_existente = Reserva.query.filter_by(fecha=fecha, hora=hora, email=email, cancelada=False).first()
    if reserva_existente:
        return jsonify({'error': 'Ya existe una reserva para esa fecha y hora con ese correo'}), 400

    token = generate_token()
    while Reserva.query.filter_by(token=token).first() is not None:
        token = generate_token()

    nueva_reserva = Reserva(
        nombre=nombre,
        telefono=telefono,
        email=email,
        fecha=fecha,
        hora=hora,
        servicio=servicio,
        token=token,
        cancelada=False
    )

    try:
        db.session.add(nueva_reserva)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear reserva: {str(e)}'}), 500

    return jsonify({'reserva': {'id': nueva_reserva.id, 'token': nueva_reserva.token}}), 201

@api.route('/enviar-email', methods=['POST'])
def enviar_email():
    data = request.json
    if not data:
        return jsonify({'error': 'No se recibió JSON válido'}), 400

    email_destino = data.get('email')
    asunto = data.get('asunto')
    mensaje = data.get('mensaje')

    if not email_destino or not asunto or not mensaje:
        return jsonify({'error': 'Faltan datos para enviar email'}), 400

    success, info = enviar_email_smtp(email_destino, asunto, mensaje)
    if success:
        return jsonify({'message': info}), 200
    else:
        current_app.logger.error(f"Error enviando correo: {info}")
        return jsonify({'error': f'Error enviando correo: {info}'}), 500

@api.route('/cancelar-reserva/<token>', methods=['POST'])
def cancelar_reserva(token):
    reserva = Reserva.query.filter_by(token=token, cancelada=False).first()
    if not reserva:
        return jsonify({'error': 'Token inválido o reserva ya cancelada'}), 404

    reserva.cancelada = True
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error cancelando reserva: {str(e)}'}), 500

    return jsonify({'message': 'Reserva cancelada correctamente'}), 200
