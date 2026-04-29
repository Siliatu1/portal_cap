import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { loginByDocumento } from "../services/apiService";
import { useAuth } from "../shared/context/AuthContext";
import { validateUserAccess } from "./authRoles";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [documento, setDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const normalizarDocumento = (valor) => String(valor || '').replace(/\D/g, '');

  const handleLogin = async () => {
    if (!documento.trim()) {
      setMensaje({ texto: "Por favor ingrese su número de documento", tipo: "error" });
      return;
    }

    setLoading(true);
    setMensaje({ texto: "", tipo: "" });
    
    try {
      const rawData = await loginByDocumento(documento);
        
        // La API puede retornar { data: {...} } o directamente {...}
        const data = rawData;
        
        // Validar que el usuario tenga un rol autorizado
        const validationResult = validateUserAccess(data);
        if (!validationResult.authorized) {
          setMensaje({ 
            texto: validationResult.message, 
            tipo: "error" 
          });
          setLoading(false);
          return;
        }
        
        setMensaje({ texto: "Documento validado correctamente", tipo: "success" });

        setTimeout(() => {
          login(data);
          
          // Determinar a dónde redirigir basado en el documento
          const documentoUsuario = data?.document_number || '';
          
          // Si es una instructora de evaluación todera
          const documentoNormalizado = normalizarDocumento(documentoUsuario);

          if (documentosToderas.map(normalizarDocumento).includes(documentoNormalizado)) {
            navigate('/portal/lineas-producto/panel-toderas');
          }
          // Si es el encargado de asistencia Escuela del Café
          else if (documentoNormalizado === normalizarDocumento(documentoAsistencia)) {
            navigate('/portal/lineas-producto/asistencia');
          }
          // Para todos los demás, ir al menú principal
          else {
            navigate('/menu');
          }
        }, 1500);
    } catch (error) {
      if (error?.status) {
        setMensaje({ 
          texto: `Documento no autorizado (Error ${error.status})`, 
          tipo: "error" 
        });
      } else {
        setMensaje({ texto: "Error de conexión al validar el documento", tipo: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  
  return (
    <div className="login-container">
      <div className="decoration-circle circle-1"></div>
      <div className="decoration-circle circle-2"></div>
      <div className="decoration-circle circle-3"></div>
      
      <div className="login-card">
        <p className="login-subtitle">PORTAL CREPES & WAFFLES</p>
        
        <div className="login-form">
          <label className="login-label">NÚMERO DE DOCUMENTO</label>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Ingresa tu documento"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              onKeyPress={handleKeyPress}
              className="login-input"
            />
            <span className="input-icon"> </span>
          </div>
          
          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}
          
          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "VALIDANDO..." : "INGRESAR"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
