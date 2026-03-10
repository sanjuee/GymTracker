const ConfirmDelete = ({exercise , onDelete, onCancel}) => {
    return(
        <div className="z-9999 fixed inset-0 bg-black/60 backdrop-blur-sm
                        flex justify-center items-center"
             onClick={onCancel}>                
            <div className="bg bg-zinc-900/90 border border-zinc-600 shadow-2xl w-full max-w-sm 
                            flex justify-center items-center flex-col p-7 rounded-xl "  >

                <p className="font-outfit text-l ">Do you want to delete {exercise.name}?</p>
                <div className="">
                    <button className="bg-accent text-zinc-200 border border-gray-700  px-5  mt-1 mr-2 py-2 
                                    rounded-xl font-medium hover:bg-zinc-400 transition-colors cursor-pointer" 
                            onClick={onDelete}>OK</button>

                    <button className="bg-zinc-700 border border-gray-700 cursor-pointer
                            text-zinc-100 px-3 py-2 rounded-xl font-medium hover:bg-zinc-500/20 transition-colors "
                             onClick={onCancel}>Cancel</button>
                </div>

            </div>
        </div>   
    ) 
}

export default ConfirmDelete