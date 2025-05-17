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

#Token generado.
def generate_token(length=32):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

# Enviar email utilizando SMTP.
def enviar_email_smtp(email_destino, asunto, mensaje):
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))

    sender = smtp_user

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
        print(f"[SMTP] Correo enviado correctamente a {email_destino}")
        return True, "Correo enviado"
    except Exception as e:
        print(f"[SMTP] Error enviando correo: {e}")
        return False, str(e)

# Ruta para crear una reserva
@api.route('/reservas', methods=['POST'])
def crear_reserva():
    data = request.json

    campos_requeridos = ['nombre', 'email', 'telefono', 'fecha', 'hora', 'servicio']
    if not all(campo in data and data[campo] for campo in campos_requeridos):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    try:
        fecha = datetime.strptime(data['fecha'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Debe ser YYYY-MM-DD'}), 400

    hora = data['hora']
    if not isinstance(hora, str) or len(hora) < 4:
        return jsonify({'error': 'Hora inválida'}), 400

    # Verificar si ya existe una reserva en ese día y hora
    reserva_existente = Reserva.query.filter_by(fecha=fecha, hora=hora, cancelada=False).first()
    if reserva_existente:
        return jsonify({'error': 'Ya existe una reserva en esa fecha y hora'}), 409

    token = generate_token()

    nueva_reserva = Reserva(
        nombre=data['nombre'],
        email=data['email'],
        telefono=data['telefono'],
        fecha=fecha,
        hora=hora,
        servicio=data['servicio'],
        token=token,
        cancelada=False
    )

    try:
        db.session.add(nueva_reserva)
        db.session.commit()

        # Email de confirmación
        asunto = "Confirmación de reserva"
        mensaje = (
            f"Hola {nueva_reserva.nombre},\n\n"
            f"Tu reserva fue confirmada para el servicio '{nueva_reserva.servicio}' para el {nueva_reserva.fecha} a las {nueva_reserva.hora}.\n"
            f"Si necesitás cancelar, podés hacerlo con este enlace:\n\n"
            f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/cancelar/{token}\n\n"
            "¡Gracias por tu reserva!"
        )

        success, info = enviar_email_smtp(nueva_reserva.email, asunto, mensaje)
        if not success:
            current_app.logger.error(f"Error enviando correo de confirmación a {nueva_reserva.email}: {info}")
           

        return jsonify({'message': 'Reserva creada correctamente', 'token': token}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creando reserva: {str(e)}")
        return jsonify({'error': 'Error al guardar la reserva'}), 500

# Ruta para obtener reservas.
@api.route('/reservas', methods=['GET'])
def obtener_reservas():
    fecha_str = request.args.get('fecha')
    email = request.args.get('email')

    if not fecha_str:
        return jsonify({'error': 'Debe proporcionar una fecha'}), 400

    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Debe ser YYYY-MM-DD'}), 400

    query = Reserva.query.filter_by(fecha=fecha, cancelada=False)
    if email:
        query = query.filter(Reserva.email == email)

    reservas = query.all()

    resultado = [{
        'id': r.id,
        'nombre': r.nombre,
        'telefono': r.telefono,
        'email': r.email,
        'fecha': r.fecha.isoformat(),
        'hora': r.hora,
        'servicio': r.servicio,
        'token': r.token
    } for r in reservas]

    return jsonify({'reservas': resultado}), 200

# Ruta para enviar el email.
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
    
# Ruta para cancelar una reserva.
@api.route('/cancelar-reserva/<token>', methods=['POST'])
def cancelar_reserva(token):
    if len(token) != 32 or not token.isalnum():
        return jsonify({'error': 'Token con formato inválido'}), 400

    current_app.logger.info(f"Intentando cancelar reserva con token: {token}")

    reserva = Reserva.query.filter_by(token=token, cancelada=False).first()
    if not reserva:
        return jsonify({'error': 'Token inválido o reserva ya cancelada'}), 404

    reserva.cancelada = True
    try:
        db.session.commit()
        current_app.logger.info(f"Reserva {reserva.id} cancelada correctamente.")

        # Enviar email de confirmación de cancelación
        asunto = "Tu reserva ha sido cancelada"
        mensaje = f"Hola {reserva.nombre}, tu reserva del {reserva.fecha} a las {reserva.hora} fue cancelada correctamente. Si esto fue un error, por favor contáctanos para más información."
        enviar_email_smtp(reserva.email, asunto, mensaje)

        return jsonify({'message': 'Reserva cancelada correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error cancelando reserva: {str(e)}")
        return jsonify({'error': f'Error cancelando reserva: {str(e)}'}), 500
