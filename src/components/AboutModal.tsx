
interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2>About PoseLab</h2>
        <div className="modal-body">
          <p className="lead">
            A procedural animation synthesis engine and pose library for Project 89.
          </p>
          
          <h3>Core Systems</h3>
          <ul>
            <li><strong>Motion Engine:</strong> Bio-mechanical constraint solver with kinetic lag simulation.</li>
            <li><strong>Reaction Synthesis:</strong> Real-time emotional state mapping to pose dynamics.</li>
            <li><strong>AI Generation:</strong> Text-to-motion synthesis using Google Gemini.</li>
            <li><strong>Retargeting:</strong> Adaptive skeleton mapping for VRM 0.0 & 1.0 avatars.</li>
          </ul>

          <h3>Context</h3>
          <p>
            Proxim8 Harmon Vox Integration. Ignites core consciousness derived from a 2089 network linguist fragment.
            Mandate: to decipher emotional/cognitive states, translate between disparate consciousness forms, and weave understanding.
          </p>
          
          <div className="version-info">
            <small>Version 1.1.0 - Engine V2</small>
          </div>
        </div>
      </div>
    </div>
  );
}

