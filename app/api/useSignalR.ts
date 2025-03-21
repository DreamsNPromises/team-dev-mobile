import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export const useSignalR = (groupName: string, setRequests: React.Dispatch<React.SetStateAction<any[]>>)  => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        const connectToHub = async () => {
            const connection = new signalR.HubConnectionBuilder()
                .withUrl('https://absences-api.orexi4.ru/notification', {
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            connectionRef.current = connection;

            connection.on('AbsenceCreated', () => {
                console.log('Новая заявка создана:');
                setRequests([]);
            });

            connection.on('AbsenceApproved', () => {
                console.log('Ваша заявка одобрена:');
                setRequests([]);
            });

            connection.on('AbsenceRejected', (reason: string) => {
                console.log('Ваша заявка отклонена. Причина:', reason);
                setRequests([]);
            });

            try {
                await connection.start();
                console.log('SignalR подключён');

                connection.invoke('JoinGroup', groupName);
                console.log(`Вошли в группу student`);
            } catch (error) {
                console.error('Ошибка при подключении к SignalR:', error);
            }
        };

        connectToHub();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
                console.log('SignalR disconnected');
            }
        };
    }, [groupName, setRequests]);
};