import { X } from "lucide-react";
import { memo } from "react";

const ImagePreviewModal = memo(function ImagePreviewModal({ image, onClose }) {
    if (!image) return null;

    return (
        <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close image preview"
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            >
                <X size={17} />
            </button>

            <img
                src={image}
                alt="Location preview"
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
});

export default ImagePreviewModal;
