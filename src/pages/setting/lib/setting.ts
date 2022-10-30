import {
  BrowserJsPlumbInstance,
  newInstance,
  EVENT_CONNECTION_CLICK,
  EVENT_CONNECTION_MOUSEOUT,
  EVENT_CONNECTION_MOUSEOVER,
  EVENT_CONNECTION_MOUSEUP,
  EVENT_CONNECTION_CONTEXTMENU,
  EVENT_CONNECTION_DBL_CLICK,
  EVENT_ELEMENT_DBL_CLICK,
} from "@jsplumb/browser-ui";
import { Connection, Endpoint } from "@jsplumb/core";
import { ConfigSchema, LinkSchema, NodeSchema } from "../schemas";
import { FlowchartConnector } from "@jsplumb/connector-flowchart"
import mitt from "mitt";

const DefaultConnector = {
  type: FlowchartConnector.type,
  options: {
    cornerRadius: 8,
  },
};

function $(id: string) {
  return document.querySelector(`#${nodeId(id)}`);
}

export function nodeId(id: string) {
  return "node-" + id;
}

export function getIdByElement(element: Element) {
  return element.id.slice(5)
}

export class Setting {
  private nodes: Array<SettingNode> = [];
  private links: Array<SettingLink> = [];
  private nodesMap: Map<string, SettingNode> = new Map();
  private toLinksMap: Map<string, Array<SettingLink>> = new Map();
  private fromLinksMap: Map<string, Array<SettingLink>> = new Map();
  public jsPlumb: BrowserJsPlumbInstance;
  private emitter = mitt<{
    "link:click": { link: SettingLink; x: number; y: number };
    "link:dblclick": { link: SettingLink; x: number; y: number };
    "link:contextmenu": { link: SettingLink; x: number; y: number };
    "node:dblclick": { node: SettingNode };
  }>();
  public on = this.emitter.on;
  constructor(container: Element, private schema: ConfigSchema) {
    this.jsPlumb = newInstance({
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

    const linkHandler = (conn: any, e: MouseEvent) => {
      const link = this.getLink(conn.sourceId, conn.targetId);
      this.emitter.emit("link:click", {
        link,
        x: e.offsetX,
        y: e.offsetY,
      });
    };
    const nodeHandler = (element: Element) => {
      const nodeId = getIdByElement(element)
      const node = this.getNode(nodeId)!;
      this.emitter.emit("node:dblclick", { node });
    };

    this.jsPlumb.bind(EVENT_CONNECTION_CLICK, linkHandler);
    this.jsPlumb.bind(EVENT_CONNECTION_DBL_CLICK, linkHandler);
    this.jsPlumb.bind(EVENT_CONNECTION_CONTEXTMENU, linkHandler);
    this.jsPlumb.bind(EVENT_ELEMENT_DBL_CLICK, nodeHandler);

    this.jsPlumb.bind(EVENT_CONNECTION_MOUSEOVER, (conn, e) => {
      const link = this.getLink(conn.sourceId, conn.targetId);
    });
    this.jsPlumb.bind(EVENT_CONNECTION_MOUSEOVER, (conn, e) => {
      console.log(e);
    });
  }

  checkLinkable(from: string, to: string) {
    if (this.links.find((item) => item.from === from && item.to === to)) {
      return false;
    }
    return true;
  }

  addNode(nodeSchema: NodeSchema) {
    const node = new SettingNode(this, nodeSchema);
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
    const link = new SettingLink(this, { from, to });
    this.links.push(link);

    this.toLinksMap.get(from)?.push(link);
    this.fromLinksMap.get(to)?.push(link);
  }

  removeLink(link: { from: string; to: string }) {
    const index = this.links.findIndex(
      (item) => item.from === link.from && item.to === link.to
    );
    this.links.splice(index, 1);
  }

  getNode(id: string) {
    return this.nodesMap.get(id)!;
  }

  getLink(from: string, to: string) {
    return this.links.find((item) => item.from === from && item.to === to)!;
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
  constructor(private setting: Setting, private schema: NodeSchema) {
    this.id = schema.id;
    this.el = $(schema.id)!;
    this.fromEp = this.setting.jsPlumb.addEndpoint(this.el, {
      anchor: "Right",
      endpoint: "Dot",
      source: true,
    });
    this.toEp = this.setting.jsPlumb.addEndpoint(this.el, {
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

  get type() {
    return this.schema.type;
  }

  get config() {
    return this.schema.config;
  }
}

class SettingLink {
  private connection: Connection;
  constructor(private setting: Setting, private schema: LinkSchema) {
    const fromNode = this.setting.getNode(schema.from);
    const toNode = this.setting.getNode(schema.to);
    this.connection = this.setting.jsPlumb.connect({
      source: fromNode.fromEp,
      target: toNode.toEp,
      connector: DefaultConnector,
    });
  }

  get from() {
    return this.schema.from;
  }

  get to() {
    return this.schema.to;
  }

  get modifiers() {
    return this.schema.modifiers;
  }

  get condition() {
    return this.schema.condition;
  }

  enterHover() {}

  leaveHover() {}
}
