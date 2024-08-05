import React from 'react'
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/LoginSlice';
import useWebSocket from 'react-use-websocket';

const Home = () => {
  const user = useSelector(selectUser);
  
  // const WS_URL = 'ws://127.0.0.1:8888';
  // const {sendJsonMessage} = useWebSocket(WS_URL, {
  //   queryParams: {token: user.token, name: user.name},
  // });
  
  return (
    <h1>Hello, {user.name}</h1>
  )
}

export default Home