import { BrowserJsPlumbInstance, newInstance, EVENT_CONNECTION_CLICK } from "@jsplumb/browser-ui";
import { Endpoint } from "@jsplumb/core";
import { ConfigSchema, LinkSchema, NodeSchema } from "../types";
import { BezierConnector } from "@jsplumb/connector-bezier";

const DefaultConnector = {
  type: BezierConnector.type,
  options: {
    curviness: 50,
  },
};

function $(id: string) {
  return document.querySelector(`#${nodeId(id)}`);
}

export function nodeId(id: string) {
  return "node-" + id;
}

export class Setting {
  private nodes: Array<SettingNode> = [];
  private links: Array<SettingLink> = [];
  private nodesMap: Map<string, SettingNode> = new Map();
  private toLinksMap: Map<string, Array<SettingLink>> = new Map();
  private fromLinksMap: Map<string, Array<SettingLink>> = new Map();
  private instance: BrowserJsPlumbInstance;
  constructor(container: Element, private schema: ConfigSchema) {
    this.instance = newInstance({
      container,
      connectionsDetachable: false,
      dragOptions: {
        grid: {
          h: 10,
          w: 10,
        },
      },
      connector: DefaultConnector,
    });
    for (const node of schema.nodes) {
      this.initNode(node);
    }
    for (const link of schema.links) {
        this.initLink(link);
    }

    this.instance.bind(EVENT_CONNECTION_CLICK, (conn, e) => {
        console.log(conn, e)
    })
  }

  checkLinkable(from: string, to: string) {
    if (this.links.find((item) => item.from === from && item.to === to)) {
      return false;
    }
    return true;
  }

  addNode(nodeSchema: NodeSchema) {
    const node = new SettingNode(this.instance, nodeSchema);
    this.nodes.push(node);
    this.nodesMap.set(node.id, node);
    this.toLinksMap.set(node.id, []);
    this.fromLinksMap.set(node.id, []);
  }

  removeNode(id: string) {
    const fromLinks = this.fromLinksMap.get(id)!;
    const toLinks = this.toLinksMap.get(id)!;
    fromLinks.forEach((item) => this.removeLink(item));
    toLinks.forEach((item) => this.removeLink(item));

    const index = this.nodes.findIndex((item) => item.id === id)!;
    this.nodes.splice(index, 1);
    this.nodesMap.delete(id);
    this.fromLinksMap.delete(id);
    this.toLinksMap.delete(id);
  }

  addLink(from: string, to: string) {
    const fromNode = this.getNode(from);
    const toNode = this.getNode(to);

    const link = new SettingLink({ from, to });
    this.links.push(link);

    this.toLinksMap.get(from)?.push(link);
    this.fromLinksMap.get(to)?.push(link);

    this.instance.connect({
      source: fromNode.fromEp,
      target: toNode.toEp,
      connector: DefaultConnector,
    });
  }

  removeLink(link: { from: string; to: string }) {
    const index = this.links.findIndex(
      (item) => item.from === link.from && item.to === link.to
    );
    this.links.splice(index, 1);
  }

  private getNode(id: string) {
    return this.nodesMap.get(id)!;
  }

  private initNode(nodeSchema: NodeSchema) {
    this.addNode(nodeSchema);
  }

  private initLink(linkSchema: LinkSchema) {
    this.addLink(linkSchema.from, linkSchema.to);
  }
}

class SettingNode {
  public fromEp: Endpoint;
  public toEp: Endpoint;
  public el: Element;
  public id: string;
  constructor(
    private instance: BrowserJsPlumbInstance,
    private schema: NodeSchema
  ) {
    this.id = schema.id;
    this.el = $(schema.id)!;
    this.fromEp = instance.addEndpoint(this.el, {
      anchor: "Right",
      endpoint: "Dot",
      source: true,
    });
    this.toEp = instance.addEndpoint(this.el, {
      anchor: "Left",
      endpoint: "Dot",
      target: true,
    });
  }

  get x() {
    return this.schema.x;
  }

  set x(v: number) {
    this.schema.x = v;
  }

  get y() {
    return this.schema.y;
  }

  set y(v: number) {
    this.schema.y = v;
  }
}

class SettingLink {
  constructor(private schema: LinkSchema) {}

  get from() {
    return this.schema.from;
  }

  get to() {
    return this.schema.to;
  }
}
