import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import testRouter from "../routes/test.route";
import parserRouter from "../routes/parser.route";

dotenv.config();

export class Server {
  public app: Application;
  public port: number;

  // Rutas base
  private testPath = "/api/test";
  private parserPath = "/api/parser";
 

  constructor() {
    console.log('🚀 Initializing GoScript Interpreter Server...');
    this.app = express();
    this.port = Number(process.env.PORT) || 3001;
    console.log(`📡 Server will run on port: ${this.port}`);

    this.middlewares();
    this.routes();
    console.log('✅ Server initialization complete');
  }

  private middlewares() {
    this.app.use(cors());
    this.app.use(express.json({ limit: "10mb" }));
  }

  private routes() {
    this.app.use(this.testPath, testRouter);
    this.app.use(this.parserPath, parserRouter);

    // Ruta de prueba básica
    this.app.get('/', (req: Request, res: Response) => {
      res.json({ message: 'GoScript Interpreter API is running!' });
    });
  }

  public async listen() {
    this.app.listen(this.port, '0.0.0.0', async () => {
      console.log(`Server running on port ${this.port}`);
      console.log(`Server listening on http://localhost:${this.port}`);
      console.log(`Server listening on http://127.0.0.1:${this.port}`);
    });
  }
}
