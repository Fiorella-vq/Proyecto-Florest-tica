from flask import Blueprint, request, jsonify
from twilio.rest import Client
from models import db, Reserva
import os
from dotenv import load_dotenv

load_dotenv()  

api = Blueprint('api', __name__)

@api.route('/reservas', methods=['POST'])
def crear_reserva():
    data = request.get_json()

    # Datos de la reserva
    nombre = data.get('nombre')
    telefono = data.get('telefono')
    fecha = data.get('fecha')
    hora = data.get('hora')
    servicio = data.get('servicio')

   
    if not nombre or not telefono or not fecha or not hora or not servicio:
        return jsonify({"message": "Todos los campos son requeridos"}), 400

 
    reserva = Reserva(nombre=nombre, telefono=telefono, fecha=fecha, hora=hora, servicio=servicio)
    db.session.add(reserva)
    db.session.commit()

    # Enviar un mensaje de texto (puedes cambiar esto por un correo si prefieres)
    enviar_sms(reserva)

    return jsonify({"message": "Reserva creada con éxito", "reserva": reserva.serialize()}), 201

# Función para enviar el mensaje de texto con la información de la reserva
def enviar_sms(reserva):
    try:
        # Configura Twilio con las variables de entorno
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        from_number = os.getenv('TWILIO_PHONE_NUMBER')
        client = Client(account_sid, auth_token)

        # Número de teléfono del que se enviará el mensaje
        to_number = reserva.telefono  # Número del usuario que hizo la reserva

        # Mensaje de texto con la información de la reserva
        mensaje = f"Reserva confirmada:\nServicio: {reserva.servicio}\nFecha: {reserva.fecha}\nHora: {reserva.hora}\nGracias por confiar en nosotros."

        # Enviar el mensaje
        client.messages.create(body=mensaje, from_=from_number, to=to_number)

    except Exception as e:
        print(f"Error al enviar SMS: {e}")
