export class Node {
    public valor: string;
    public hijos: Node[];

    constructor(valor: string) {
        this.valor = valor;
        this.hijos = [];
    }

    public pushChild(hijo: Node): void {
        this.hijos.push(hijo);
    }
}