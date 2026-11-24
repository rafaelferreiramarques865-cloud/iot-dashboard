const express = require("express"); 
const mqtt = require("mqtt"); 
 
const app = express(); 
 
const PORT = process.env.PORT || 3000; 
 
// TÓPICO MQTT 
const TOPICO = "faculdade/iot/temperatura/grupo01"; 
 
// ARMAZENAMENTO TEMPORÁRIO 
let ultimaLeitura = null; 
let historico = []; 
 
// CONECTAR AO BROKER MQTT 
const client = mqtt.connect( 
  "mqtt://broker.hivemq.com:1883" 
); 
 
client.on("connect", () => { 
 
  console.log("Conectado ao broker MQTT!"); 
 
  client.subscribe(TOPICO, (erro) => { 
 
    if (!erro) { 
      console.log("Inscrito no topico:", TOPICO); 
    } 
 
  }); 
 
}); 
 
// RECEBER MENSAGENS 
client.on("message", (topic, message) => { 
 
  try { 
 
    const dados = JSON.parse(message.toString()); 
 
    ultimaLeitura = { 
      ...dados, 
      horario: new Date().toISOString() 
    }; 
 
    historico.push(ultimaLeitura); 
 
    // MANTER AS ÚLTIMAS 100 LEITURAS 
    if (historico.length > 100) { 
      historico.shift(); 
    } 
 
    console.log("Nova leitura recebida:"); 
    console.log(ultimaLeitura); 
 
  } catch (erro) { 
 
    console.log("Erro ao processar mensagem:", erro); 
 
  } 
 
}); 
 
// DISPONIBILIZAR A PASTA PUBLIC 
app.use(express.static("public")); 
 
// API: ÚLTIMA LEITURA 
app.get("/api/temperatura", (req, res) => { 
 
  res.json(ultimaLeitura); 
 
}); 
 
// API: HISTÓRICO 
app.get("/api/historico", (req, res) => { 
 
  res.json(historico); 
 
}); 
// INICIAR SERVIDOR 
app.listen(PORT, () => { 
console.log("Servidor iniciado!"); 
console.log(`Acesse: http://localhost:${PORT}`); 
}); 
4.3. Entendendo o que acontece 
Vamos imaginar que o ESP32 envie: 
{ 
"dispositivo": "sensor_grupo01", 
"temperatura": 28.5, 
"umidade": 65.2 
} 