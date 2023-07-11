import React, { useState, useRef, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import './App.css';

const App = observer(() => {

	const [isPaused, setIsPaused] = useState(false);
	const [messages, setMessages] = useState([]);
	const [data, setData] = useState("");
	const [status, setStatus] = useState("");
	const [res, setRes] = useState("");
	const socket = useRef()

	useEffect(() => {
		if (!isPaused) {
			socket.current = new WebSocket('ws://172.20.10.2:8889/ws') // создаем ws соединение
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
						{/* <td >{item.parameter1}</td>
						<td >{item.parameter2}</td>
						<td >{item.parameter3}</td>
						<td >{item.parameter4}</td>
						<td >{item.parameter5}</td>
						<td >{item.parameter6}</td>
						<td >{item.parameter7}</td> */}
						<td className="green-item">{item.parameter2}</td>
					</tr>
				}
				else {
					return <tr key={item.id}>
						<td >{item.record}</td>
						<td >{item.parameter1}</td>
						{/* <td >{item.parameter1}</td>
						<td >{item.parameter2}</td>
						<td >{item.parameter3}</td>
						<td >{item.parameter4}</td>
						<td >{item.parameter5}</td>
						<td >{item.parameter6}</td>
						<td >{item.parameter7}</td> */}
						<td className="red-item">{item.parameter2}</td>
					</tr>
				}
			}))
		}

	}, [isPaused])

	return (
		<div>
			{!!data &&
				<div className="window">
					<div className="container">
						<h1 className="header">{status}</h1>
						<button className="btn" onClick={() => {
							socket.current.close();
							setIsPaused(!isPaused)
							console.log(isPaused)
						}}>{!isPaused ? 'Остановить соединение' : 'Открыть соединение'}
						</button>
					</div>
					<table className="myTable">
						<thead>
							<tr>
								<th>КП</th>
								<th>Номинальное значение</th>
								<th>Текущее значение</th>
								{/* <th>Параметр4</th>
								<th>Параметр5</th>
								<th>Параметр6</th>
								<th>Параметр7</th>
								<th>Параметр8</th> */}
							</tr>
						</thead>
						<tbody>
							{res}
						</tbody>
					</table>
				</div>
			}
		</div>
	);
});

export default App;