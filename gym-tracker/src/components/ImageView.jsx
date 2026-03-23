const ImageView = ({imageUrl, onClose}) => {
    return (
        <div className="fixed inset-0 flex min-h-screen backdrop-blur-3xl justify-center items-center px-3" 
             style={{zIndex: 9999}}
             onClick={onClose}>
            <img className="rounded-2xl"
                 src={imageUrl}
                 onClick={(e) => e.stopPropagation()}/>
        </div>
    )
}

export default ImageView