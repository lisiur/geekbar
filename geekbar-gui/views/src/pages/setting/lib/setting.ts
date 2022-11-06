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
  private inputLinksMap: Map<string, Set<SettingLink>> = new Map();
  private outputLinksMap: Map<string, Set<SettingLink>> = new Map();
  public jsPlumb: BrowserJsPlumbInstance;
  private emitter = mitt<{
    "link:click": { link: SettingLink; event: MouseEvent };
    "link:dblclick": { link: SettingLink; event: MouseEvent };
    "link:contextmenu": { link: SettingLink; event: MouseEvent };
    "link:connect": { link: SettingLink; event: MouseEvent };
    "node:dblclick": { node: SettingNode; event: MouseEvent };
    changed: void;
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
      this.syncNode(node);
    }
    for (const link of schema.links) {
      this.syncLink(link.from, link.to);
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
        // "ignoreLogic" means does not handle connect event
        if (conn.data?.mark !== "ignoreLogic") {
          const from = extractId(conn.source.id);
          const to = extractId(conn.target.id);
          // delete user dragged connection
          setTimeout(() => {
            this.jsPlumb.deleteConnection(conn);
            // redraw with `addLink`
            const link = this.addLink(from, to);
            linkHandler("link:connect", link.connection, event);
          });
        }
      }
    );
    this.jsPlumb.bind(
      EVENT_ELEMENT_DBL_CLICK,
      nodeHandler.bind(null, "node:dblclick")
    );
    this.jsPlumb.bind(
      EVENT_DRAG_MOVE,
      (payload: { el: Element; pos: { x: number; y: number } }) => {
        const node = this.getNode(payload.el.id);
        node.x = payload.pos.x;
        node.y = payload.pos.y;
        const fromLinks = this.outputLinksMap.get(node.id)!;
        const toLinks = this.inputLinksMap.get(node.id)!;
        fromLinks.forEach((item) => item.redraw());
        toLinks.forEach((item) => item.redraw());
      }
    );
    this.jsPlumb.bind(
      EVENT_DRAG_STOP,
      () => this.emitter.emit("changed"),
    )
  }

  checkLinkable(from: string, to: string) {
    if (this.links.find((item) => item.from === from && item.to === to)) {
      return false;
    }
    return true;
  }

  private syncNode(nodeSchema: NodeSchema) {
    const node = new SettingNode(this, nodeSchema);
    this.jsPlumb.manage($(nodeSchema.id)!);
    this.nodes.push(node);
    this.nodesMap.set(node.id, node);
    this.inputLinksMap.set(node.id, new Set());
    this.outputLinksMap.set(node.id, new Set());
  }

  toSchema(): ConfigSchema {
    return {
      id: this.schema.id,
      title: this.schema.title,
      nodes: this.nodes.map(item => item.toSchema()),
      links: this.links.map(item => item.toSchema())
    }
  }

  addNode(node: NodeSchema) {
    this.schema.nodes.push(node);
    setTimeout(() => {
      this.jsPlumb.manage($(node.id)!);
      this.syncNode(node);
      this.emitter.emit("changed");
    });
  }

  removeNode(id: string) {
    id = extractId(id);

    // remove relative link info
    const outputLinks = this.outputLinksMap.get(id)!;
    const inputLinks = this.inputLinksMap.get(id)!;
    outputLinks.forEach((item) => this.removeLink(item));
    inputLinks.forEach((item) => this.removeLink(item));
    this.outputLinksMap.delete(id);
    this.inputLinksMap.delete(id);

    // remove node info
    const index = this.nodes.findIndex((item) => item.id === id)!;
    this.nodes.splice(index, 1);
    this.nodesMap.delete(id);

    // remove schema info
    this.schema.nodes.splice(
      this.schema.nodes.findIndex((item) => item.id === id),
      1
    );

    this.emitter.emit("changed");
  }

  addLink(from: string, to: string) {
    from = extractId(from);
    to = extractId(to);
    this.schema.links.push({
      from,
      to,
    });
    const link = this.syncLink(from, to);

    this.emitter.emit("changed");
    return link;
  }

  private syncLink(from: string, to: string) {
    const link = new SettingLink(this, { from, to });
    this.links.push(link);

    this.inputLinksMap.get(to)!.add(link);
    this.outputLinksMap.get(from)!.add(link);

    return link;
  }

  removeLink(link: { from: string; to: string }) {
    let index = this.links.findIndex(
      (item) => item.from === link.from && item.to === link.to
    );
    const deletedLink = this.links[index];
    deletedLink.remove();
    this.links.splice(index, 1);

    this.inputLinksMap.get(link.to)!.delete(deletedLink);
    this.outputLinksMap.get(link.from)!.delete(deletedLink);

    index = this.schema.links.findIndex(
      (item) => item.from === link.from && item.to === link.to
    );
    this.schema.links.splice(index, 1);

    this.emitter.emit("changed");
  }

  getNode(id: string) {
    return this.nodesMap.get(extractId(id))!;
  }

  getLink(from: string, to: string) {
    return this.links.find(
      (item) => item.from === extractId(from) && item.to === extractId(to)
    )!;
  }

  destroy() {
    this.jsPlumb.destroy()
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
  
  set config(config: Record<string, any>) {
    this.schema.config = config
  }

  toSchema(): NodeSchema {
    return this.schema
  }
}

class SettingLink {
  public connection: Connection;
  private fromNode: SettingNode;
  private toNode: SettingNode;
  constructor(private setting: Setting, private schema: LinkSchema) {
    this.fromNode = this.setting.getNode(schema.from);
    this.toNode = this.setting.getNode(schema.to);
    this.connection = this.draw();
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

  toSchema(): LinkSchema {
    return this.schema
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
    this.connection = this.setting.jsPlumb.connect({
      source: this.fromNode.el,
      target: this.toNode.el,
      connector:
        this.fromNode.y === this.toNode.y
          ? DefaultFlowchartConnector
          : DefaultBezierConnector,
      anchors: ["Right", "Left"],
      endpoint: "Blank",
      data: {
        mark: "ignoreLogic",
      },
    });
    return this.connection;
  }

  remove() {
    this.setting.jsPlumb.deleteConnection(this.connection);
  }
}
