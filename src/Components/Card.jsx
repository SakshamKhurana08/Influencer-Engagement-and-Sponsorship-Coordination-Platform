import "./index.css";

const Card = () => {
    return (
        <div className="w-full fixed bottom-0 max-h-[120px] overflow-hidden px-2">
            <div
                className="slider"
                style={{
                    '--width': '100px',       // reduced width
                    '--height': '60px',       // reduced height
                    '--quantity': '10',
                }}
            >
                <div className="list gap-2">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="item"
                            style={{
                                '--position': i + 1,
                                width: 'var(--width)',
                                height: 'var(--height)',
                            }}
                        >
                            <img
                                src={`/assets/slider1_${i + 1}.png`}
                                alt={`slide-${i + 1}`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Card;
