import {
  BrowserJsPlumbInstance,
  newInstance,
  EVENT_CONNECTION_CLICK,
  EVENT_CONNECTION_CONTEXTMENU,
  EVENT_CONNECTION_DBL_CLICK,
  EVENT_ELEMENT_DBL_CLICK,
  EVENT_ELEMENT_CONTEXTMENU,
  EVENT_DRAG_STOP,
  EVENT_DROP,
  EVENT_ELEMENT_MOUSE_UP,
  EVENT_ELEMENT_MOUSE_OVER,
  EVENT_ELEMENT_MOUSE_OUT,
  EVENT_DRAG_MOVE,
} from "@jsplumb/browser-ui";
import {
  Connection,
  Endpoint,
  EVENT_CONNECTION,
  EVENT_CONNECTION_MOVED,
} from "@jsplumb/core";
import { ConfigSchema, LinkSchema, NodeSchema } from "../schemas";
import { FlowchartConnector } from "@jsplumb/connector-flowchart";
import { BezierConnector } from "@jsplumb/connector-bezier";
import mitt from "mitt";

const NODE_ID_PREFIX = "node-";

const DefaultBezierConnector = {
  type: BezierConnector.type,
  options: {
    curviness: 50,
  },
};

const DefaultFlowchartConnector = {
  type: FlowchartConnector.type,
  options: {
    cornerRadius: 8,
  },
};

function $(id: string) {
  return document.querySelector(`#${nodeId(id)}`);
}

export function nodeId(id: string) {
  return NODE_ID_PREFIX + id;
}

export function extractId(id: string) {
  if (id.startsWith(NODE_ID_PREFIX)) {
    return id.slice(NODE_ID_PREFIX.length);
  } else {
    return id;
  }
}

export class Setting {
  private nodes: Array<SettingNode> = [];
  private links: Array<SettingLink> = [];
  private nodesMap: Map<string, SettingNode> = new Map();
  private toLinksMap: Map<string, Array<SettingLink>> = new Map();
  private fromLinksMap: Map<string, Array<SettingLink>> = new Map();
  public jsPlumb: BrowserJsPlumbInstance;
  private emitter = mitt<{
    "link:click": { link: SettingLink; event: MouseEvent };
    "link:dblclick": { link: SettingLink; event: MouseEvent };
    "link:contextmenu": { link: SettingLink; event: MouseEvent };
    "link:connect": { link: SettingLink; event: MouseEvent };
    "node:dblclick": { node: SettingNode; event: MouseEvent };
    "node:contextmenu": { node: SettingNode; event: MouseEvent };
    "blank:contextmenu": { event: MouseEvent };
  }>();
  public on = this.emitter.on;
  constructor(container: Element, public schema: ConfigSchema) {
    this.jsPlumb = newInstance({
      container,
      connectionsDetachable: false,
      dragOptions: {
        grid: {
          h: 10,
          w: 10,
        },
      },
      connector: DefaultBezierConnector,
    });
    this.jsPlumb.addSourceSelector(".source-selector", {
      anchor: "Right",
      endpoint: "Blank",
      maxConnections: -1,
    });
    this.jsPlumb.addTargetSelector(".target-selector", {
      anchor: "Left",
      endpoint: "Blank",
      maxConnections: -1,
    });
    for (const node of schema.nodes) {
      this.initNode(node);
    }
    for (const link of schema.links) {
      this.initLink(link);
    }

    const linkHandler = (type: string, conn: Connection, event: MouseEvent) => {
      const link = this.getLink(conn.source.id, conn.target.id);
      this.emitter.emit(type as any, { link, event });
    };
    const nodeHandler = (type: string, element: Element, event: MouseEvent) => {
      const nodeId = extractId(element.id);
      const node = this.getNode(nodeId)!;
      this.emitter.emit(type as any, { node, event });
    };

    this.jsPlumb.bind(
      EVENT_CONNECTION_CLICK,
      linkHandler.bind(null, "link:click")
    );
    this.jsPlumb.bind(
      EVENT_CONNECTION_DBL_CLICK,
      linkHandler.bind(null, "link:dblclick")
    );
    this.jsPlumb.bind(
      EVENT_CONNECTION_CONTEXTMENU,
      linkHandler.bind(null, "link:contextmenu")
    );
    this.jsPlumb.bind(
      EVENT_CONNECTION,
      (payload: { connection: Connection }, event: MouseEvent) => {
        const conn = payload.connection;
        const from = extractId(conn.source.id);
        const to = extractId(conn.target.id);
        // loopback
        if (from === to) {
          setTimeout(() => {
            this.jsPlumb.deleteConnection(conn);
          });
          return;
        }
        const existLink = this.getLink(from, to);
        if (existLink) {
          if (existLink.ignoreLogic) {
            existLink.ignoreLogic = false
            return;
          } else {
            setTimeout(() => {
              existLink.remove()
            });
            return;
          }
        }
        this.addLink(from, to, conn);
        linkHandler("link:connect", conn, event);
      }
    );
    this.jsPlumb.bind(
      EVENT_ELEMENT_DBL_CLICK,
      nodeHandler.bind(null, "node:dblclick")
    );
    this.jsPlumb.bind(
      EVENT_ELEMENT_CONTEXTMENU,
      nodeHandler.bind(null, "node:contextmenu")
    );
    this.jsPlumb.bind(EVENT_ELEMENT_MOUSE_OVER, (element: Element) => {
      const node = this.getNode(element.id)!;
    });
    this.jsPlumb.bind(EVENT_ELEMENT_MOUSE_OUT, (element: Element) => {
      const node = this.getNode(element.id)!;
    });
    this.jsPlumb.bind(
      EVENT_DRAG_MOVE,
      (payload: { el: Element; pos: { x: number; y: number } }) => {
        const node = this.getNode(payload.el.id);
        node.x = payload.pos.x;
        node.y = payload.pos.y;
        const fromLinks = this.fromLinksMap.get(node.id)!;
        const toLinks = this.toLinksMap.get(node.id)!;
        fromLinks.concat(toLinks).forEach((item) => item.redraw());
      }
    );
  }

  checkLinkable(from: string, to: string) {
    if (this.links.find((item) => item.from === from && item.to === to)) {
      return false;
    }
    return true;
  }

  private syncNode(nodeSchema: NodeSchema) {
    const node = new SettingNode(this, nodeSchema);
    this.nodes.push(node);
    this.nodesMap.set(node.id, node);
    this.toLinksMap.set(node.id, []);
    this.fromLinksMap.set(node.id, []);
  }

  addNode(node: NodeSchema) {
    this.schema.nodes.push(node);
    this.syncNode(node);
  }

  removeNode(id: string) {
    // remove relative link info
    const fromLinks = this.fromLinksMap.get(id)!;
    const toLinks = this.toLinksMap.get(id)!;
    fromLinks.forEach((item) => this.removeLink(item));
    toLinks.forEach((item) => this.removeLink(item));

    // remove node info
    const index = this.nodes.findIndex((item) => item.id === id)!;
    this.nodes.splice(index, 1);
    this.nodesMap.delete(id);
    this.fromLinksMap.delete(id);
    this.toLinksMap.delete(id);

    // remove schema
    this.schema.nodes.splice(
      this.schema.nodes.findIndex((item) => item.id === id),
      1
    );
  }

  addLink(from: string, to: string, conn?: Connection) {
    this.schema.links.push({
      from,
      to,
    });
    this.syncLink(from, to, conn);
  }

  private syncLink(from: string, to: string, conn?: Connection) {
    const link = new SettingLink(this, { from, to }, conn);
    this.links.push(link);

    this.toLinksMap.get(from)?.push(link);
    this.fromLinksMap.get(to)?.push(link);
  }

  removeLink(link: { from: string; to: string }) {
    let index = this.links.findIndex(
      (item) => item.from === link.from && item.to === link.to
    );
    this.links[index].remove();
    this.links.splice(index, 1);

    index = this.schema.links.findIndex(
      (item) => item.from === link.from && item.to === link.to
    );
    this.schema.links.splice(index, 1);
  }

  getNode(id: string) {
    return this.nodesMap.get(extractId(id))!;
  }

  getLink(from: string, to: string) {
    return this.links.find(
      (item) => item.from === extractId(from) && item.to === extractId(to)
    )!;
  }

  private initNode(nodeSchema: NodeSchema) {
    this.syncNode(nodeSchema);
  }

  private initLink(linkSchema: LinkSchema) {
    this.syncLink(linkSchema.from, linkSchema.to);
  }
}

class SettingNode {
  public el: Element;
  public id: string;
  constructor(private setting: Setting, private schema: NodeSchema) {
    this.id = schema.id;
    this.el = $(schema.id)!;
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
  private fromNode: SettingNode;
  private toNode: SettingNode;
  public ignoreLogic = false;
  constructor(
    private setting: Setting,
    private schema: LinkSchema,
    conn?: Connection
  ) {
    this.fromNode = this.setting.getNode(schema.from);
    this.toNode = this.setting.getNode(schema.to);
    this.connection = conn ?? this.draw();
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

  redraw() {
    if (this.fromNode.y === this.toNode.y) {
      if (this.connection.connector instanceof BezierConnector) {
        this.remove();
        this.draw();
      }
    } else {
      if (this.connection.connector instanceof FlowchartConnector) {
        this.remove();
        this.draw();
      }
    }
  }

  draw() {
    this.ignoreLogic = true
    this.connection = this.setting.jsPlumb.connect({
      source: this.fromNode.el,
      target: this.toNode.el,
      connector:
        this.fromNode.y === this.toNode.y
          ? DefaultFlowchartConnector
          : DefaultBezierConnector,
      anchors: ["Right", "Left"],
      endpoint: "Blank",
    });
    return this.connection;
  }

  remove() {
    this.setting.jsPlumb.deleteConnection(this.connection);
  }
}
