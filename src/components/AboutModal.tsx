
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
            PoseLab is an open-source initiative designed to democratize 3D character animation and pose creation for the VRM ecosystem. By combining procedural animation, inverse kinematics, and AI-driven synthesis, it empowers creators to bring avatars to life directly in the browser without complex 3D software.
          </p>
          <p>
            We welcome contributions from developers, animators, and AI researchers. Join us in evolving the engine on <a href="https://github.com/0xQuan93/project89-reaction-forge" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffd6', textDecoration: 'none' }}>GitHub</a>.
          </p>
          
          <div className="version-info">
            <small>Version 1.1.0 - Engine V2</small>
          </div>
        </div>
      </div>
    </div>
  );
}

