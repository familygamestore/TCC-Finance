interface ErrorMessageProps{message:string;onClose?:()=>void}
export default function ErrorMessage({message,onClose}:ErrorMessageProps){if(!message)return null;return <div className="alert"><span>⚠</span><span>{message}</span>{onClose&&<button className="btn secondary" style={{marginLeft:'auto',padding:'6px 9px'}} onClick={onClose}>Tutup</button>}</div>}
