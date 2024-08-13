import { useEffect, useState } from 'react'  // Importa os hooks useEffect e useState do React
import { View, Text, StyleSheet, Button } from 'react-native'  // Importa componentes do React Native

import notifee, {  // Importa o módulo notifee e algumas constantes do pacote @notifee/react-native
  AuthorizationStatus,  // Status de autorização para notificações
  EventType,  // Tipos de eventos para notificações
  AndroidImportance,  // Importância para notificações no Android
  TriggerType,  // Tipos de triggers (gatilhos) para notificações
  TimestampTrigger,  // Tipo de trigger baseado em timestamp
  RepeatFrequency
} from '@notifee/react-native'

export default function App() {  // Componente principal do aplicativo
  const [statusNotification, setStatusNotification] = useState(true);  // Estado para armazenar o status da permissão de notificações

  useEffect(() => {  // Hook useEffect que roda quando o componente é montado
    async function getPermission() {  // Função assíncrona para solicitar permissão para notificações
      const settings = await notifee.requestPermission();  // Solicita a permissão do usuário
      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {  // Verifica se a permissão foi concedida
        console.log("Permission: ", settings.authorizationStatus)
        setStatusNotification(true);  // Atualiza o estado para indicar que as notificações estão permitidas
      } else {
        console.log("Usuario negou a permissao!")
        setStatusNotification(false);  // Atualiza o estado para indicar que as notificações foram negadas
      }
    }

    getPermission();  // Chama a função de permissão

  }, [])  // O array vazio como segundo argumento faz com que o useEffect rode apenas uma vez

  notifee.onBackgroundEvent(async ({ type, detail }) => {  // Define um listener para eventos de notificação em segundo plano
    const { notification, pressAction } = detail;

    if (type === EventType.PRESS) {  // Verifica se o tipo de evento foi um toque na notificação
      console.log("TOCOU NA NOTIFICACAO BACKGROUND: ", pressAction?.id)
      if (notification?.id) {
        await notifee.cancelNotification(notification?.id)  // Cancela a notificação ao ser tocada
      }
    }

    console.log("EVENT BACKGROUND")
  })

  useEffect(() => {  // Hook useEffect para escutar eventos de notificação em primeiro plano
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log("USUARIO DESCARTOU A NOTIFICACAO")  // Evento quando a notificação é descartada pelo usuário
          break;
        case EventType.PRESS:
          console.log("TOCOU: ", detail.notification)  // Evento quando a notificação é tocada
      }
    })
  }, [])  // O array vazio faz com que o useEffect rode apenas uma vez quando o componente é montado

  async function handleNotificate() {  // Função para enviar uma notificação imediata
    if (!statusNotification) {
      return;  // Se as notificações não forem permitidas, a função não faz nada
    }

    const channelId = await notifee.createChannel({  // Cria um canal de notificação no Android
      id: 'lembrete',
      name: 'lembrete',
      vibration: true,
      importance: AndroidImportance.HIGH  // Define a importância alta para a notificação
    })

    await notifee.displayNotification({  // Exibe a notificação
      id: 'lembrete',
      title: 'Estudar programaçao!',
      body: 'Lembrete para estudar react-native amanha!',
      android: {
        channelId,  // Usa o canal criado anteriormente
        pressAction: {
          id: 'default'
        }
      }
    })
  }

  async function handleScheduleNotification() {  // Função para agendar uma notificação para um minuto no futuro
    const date = new Date(Date.now());

    date.setMinutes(date.getMinutes() + 1);  // Adiciona um minuto à hora atual

    const trigger: TimestampTrigger = {  // Define um trigger de notificação baseado em timestamp
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime()  // Converte a data para um timestamp
    }

    const notification = await notifee.createTriggerNotification({  // Cria uma notificação agendada
      title: "Lembrete Estudo",
      body: "Estudar JavaScript as 15:30",
      android: {
        channelId: 'lembrete',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        }
      }
    }, trigger)

    console.log("Notification agendada: ", notification)  // Loga a notificação agendada
  }

  function handleListNotifications() {  // Função para listar as notificações agendadas
    notifee.getTriggerNotificationIds()
      .then((ids) => {
        console.log(ids)  // Loga os IDs das notificações agendadas
      })
  }

  async function handleCancelNotification() {  // Função para cancelar uma notificação específica
    await notifee.cancelNotification("bTHrlD2GY5qk2m8mJkRF")  // Cancela a notificação pelo ID
    console.log("Notificaçao cancelada com sucesso!")  // Loga que a notificação foi cancelada
  }

  async function handleScheduleWeekly() {  // Função assíncrona para agendar uma notificação semanal
    const date = new Date(Date.now());  // Cria um novo objeto de data com o horário atual

    date.setMinutes(date.getMinutes() + 2);  // Ajusta o horário para 2 minutos no futuro

    const trigger: TimestampTrigger = {  // Define um trigger de notificação baseado em timestamp
      type: TriggerType.TIMESTAMP,  // Especifica que o tipo de trigger é um timestamp
      timestamp: date.getTime(),  // Define o timestamp como o horário ajustado
      repeatFrequency: RepeatFrequency.WEEKLY  // Configura a repetição da notificação para ser semanal
    }

    await notifee.createTriggerNotification({  // Cria uma notificação agendada com base no trigger definido
      title: "Estudar JavaScript",  // Título da notificação
      body: "Estudar javascript todas as semanas!",  // Corpo da notificação que será exibido ao usuário
      android: {
        channelId: "lembrete",  // ID do canal no Android onde a notificação será exibida
        importance: AndroidImportance.HIGH,  // Define a importância da notificação como alta
        pressAction: {
          id: 'default',  // Ação padrão ao pressionar a notificação
        }
      }
    }, trigger);  // Passa o trigger definido para agendar a notificação
}


  return (
    // Componente View para estruturar a interface
    <View style={styles.container}>  
    {/* Texto do título do aplicativo */}
      <Text>Notificaçoes App</Text>  
      <Button
        title="Enviar notificaçao"
        onPress={handleNotificate}  // Botão para enviar uma notificação imediata
      />

      <Button
        title="Agendar notificaçao"
        onPress={handleScheduleNotification}  // Botão para agendar uma notificação
      />

      <Button
        title="Listar notificacoes"
        onPress={handleListNotifications}  // Botão para listar notificações agendadas
      />

      <Button
        title="Cancelar Notificaçao"
        onPress={handleCancelNotification}  // Botão para cancelar uma notificação específica
      />

      <Button
        title="Agendar semanal"
        onPress={handleScheduleWeekly}
      />
    </View>
  )
}

const styles = StyleSheet.create({  // Define os estilos para o componente
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
