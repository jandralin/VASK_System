import React, { useState, useRef, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import './App.css';

const App = observer(() => {

	const [isPaused, setIsPaused] = useState(false);
	const [messages, setMessages] = useState([]);
	const [data, setData] = useState("");
	const [status, setStatus] = useState("Соединение закрыто");
	const [res, setRes] = useState("");

	const socket = useRef();
	const host = '192.168.255.108'
	const port = 8889

	useEffect(() => {
		if (!isPaused) {
			socket.current = new WebSocket('ws://'+ host +':'+ port +'/ws') // создаем ws соединение
			
			socket.current.onopen = () => {
				setStatus("Соединение открыто");  // callback на ивент открытия соединения
				console.log('connected')
			}
			socket.current.onclose = () => {
				setStatus("Соединение закрыто"); // callback на ивент закрытия соединения
				console.log('disconnected')
			}
			socket.current.onerror = () => {
				console.log('Произошла ошибка')
			}
			gettingData();
		}
		return () => socket.current.close(); // когда меняется isPaused - соединение закрывается
	}, [socket, isPaused]);

	const gettingData = useCallback(() => {
		if (!socket.current) return;

		socket.current.onmessage = (event) => {                //подписка на получение данных по вебсокету
			if (isPaused) return;
			var message = JSON.parse(event.data)
			setData(message)
			messages[message.record] = message;
			setRes(messages.map(function (item) {
				if (item.parameter1 === item.parameter2) {
					return <tr key={item.id}>
						<td >{item.record}</td>
						<td >{item.parameter1}</td>
						<td className="green-item">{item.parameter2}</td>
					</tr>
				}
				else {
					return <tr key={item.id}>
						<td >{item.record}</td>
						<td >{item.parameter1}</td>
						<td className="red-item">{item.parameter2}</td>
					</tr>
				}
			}))
		}

	}, [isPaused])

	return (
		<div>
				<div className="window">
					<div className="container">
						<h1 className="header">{status}</h1>
						<div className="info">
						<p className="info-item">{`connection IP: ${host}`}</p>
						<p className="info-item">{`port: ${port}`}</p>
						</div>
						<button className="btn" onClick={() => {
							socket.current.close();
							setIsPaused(!isPaused)
						}}>{!isPaused ? 'Остановить соединение' : 'Открыть соединение'}
						</button>
					
					</div>
					{!!data &&
					<table className="myTable">
						<thead>
							<tr>
								<th>КП</th>
								<th>Номинальное значение</th>
								<th>Текущее значение</th>
							</tr>
						</thead>
						<tbody>
							{res}
						</tbody>
					</table>
					}
				</div>
		</div>
	);
});

export default App;