function PromotionModal({ isOpen, onSelect }) {

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="promotion-modal">

                <h2>Choose Promotion</h2>

                <button onClick={() => onSelect("W")}>
                    🐺 Wolf
                </button>

                <button onClick={() => onSelect("R")}>
                    🏰 Rook
                </button>

            </div>
        </div>
    );
}

export default PromotionModal;