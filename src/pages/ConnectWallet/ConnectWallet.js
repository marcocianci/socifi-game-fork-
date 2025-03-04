import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'
import { ethers } from "ethers";
import globalContext from './../../context/global/globalContext'
import LoadingScreen from '../../components/loading/LoadingScreen'

import socketContext from '../../context/websocket/socketContext'
import { CS_FETCH_LOBBY_INFO } from '../../pokergame/actions'
import './ConnectWallet.scss'

const ConnectWallet = () => {
  const { setWalletAddress: setGlobalWalletAddress, setChipsAmount } = useContext(globalContext)
  const { socket } = useContext(socketContext)
  const navigate = useNavigate()
  const useQuery = () => new URLSearchParams(useLocation().search);
  let query = useQuery()

  const [walletAddress, setWalletAddress] = useState(null);
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    if(socket !== null && socket.connected === true){
      const walletAddress = query.get('walletAddress')
      const gameId = query.get('gameId')
      const username = query.get('username')
      if(walletAddress && gameId && username){
        console.log(username)
        setGlobalWalletAddress(walletAddress)
        socket.emit(CS_FETCH_LOBBY_INFO, { walletAddress, socketId: socket.id, gameId, username })
        console.log(CS_FETCH_LOBBY_INFO, { walletAddress, socketId: socket.id, gameId, username })
        navigate('/play')
      }
    }
  }, [socket])

  async function connectWallet() {
    if (window.ethereum) {
      try {
        console.log('window.ethereum');
        console.log(window.ethereum);

        //const provider = new ethers.BrowserProvider(window.ethereum);
        const provider = new ethers.providers.Web3Provider(window.ethereum); // Corrigido para v5.7.2
        await provider.send("eth_requestAccounts", []); // Solicita ao usuário para conectar

        const signer = provider.getSigner(); // Corrigido para v5.7.2 (sem await)

        // Solicita conexão da carteira
        const address = await signer.getAddress();
        
        setWalletAddress(address);
        setGlobalWalletAddress(address); // Atualiza no contexto global também

        // Mensagem de teste a ser assinada
        const message = "This is a test";
        const signedMessage = await signer.signMessage(message);
        setSignature(signedMessage);

        console.log("Connected Wallet:", address);
        console.log("Signed Message Hash:", signedMessage);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  return (
    <>
      <button onClick={connectWallet}>
        {walletAddress ? "Wallet Connected" : "Connect Wallet"}
      </button>
      {walletAddress && <p>Connected Address: {walletAddress}</p>}
      {signature && <p>Signed Message Hash: {signature}</p>}
      <LoadingScreen />
    </>
  )
}

export default ConnectWallet