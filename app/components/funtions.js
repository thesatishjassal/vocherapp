const Helloworld = () => {
    return ( 
           <div className="hello-world">
                <h1>Hello World</h1>
                <p>This is a simple Hello World component.</p>
                <style jsx>{`
                    .hello-world {
                        text-align: center;
                        margin: 20px;
                        padding: 20px;
                        background-color: #f0f0f0;
                        border-radius: 10px;
                    }
                    h1 {
                        color: #333;
                    }
                    p {
                        color: #666;
                    }
                `}</style>
           </div>
     );
}
 
export default Helloworld;