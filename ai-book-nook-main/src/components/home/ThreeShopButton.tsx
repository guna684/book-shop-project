type Props = {
    onClick: () => void
}

export default function ThreeShopButton({ onClick }: Props) {
    return (
        <div onClick={onClick} style={style}>
            🏬
        </div>
    )
}

const style: React.CSSProperties = {
    position: 'fixed',
    bottom: '110px',   // above chatbox
    right: '25px',
    width: '60px',
    height: '60px',
    background: '#ffb703',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '26px',
    zIndex: 9999,
    boxShadow: '0 0 15px rgba(0,0,0,0.4)'
}
