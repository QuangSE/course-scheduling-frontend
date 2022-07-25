import React, { useState } from "react";
import "./tree.css";

const Tree = ({ data = [] }) => {
    return (
        <div className="">
            <ul className="">
                {data.map((tree) => (
                    <TreeNode node={tree} />
                ))}
            </ul>
        </div>
    );
};

const TreeNode = ({ node }) => {
    const [childVisible, setChildVisiblity] = useState(false);

    const hasChild = node.children ? true : false;

    return (
        <li className="no-bullets">
            <div
                className="first-item"
                onClick={(e) => setChildVisiblity((v) => !v)}
            >
                {hasChild && (
                    <div
                        className={`tree-toggler ${
                            childVisible ? "active" : ""
                        }`}
                    ></div>
                )}

                <div>{node.name}</div>
            </div>

            {hasChild && childVisible && !node.module && (
                <div className="child">
                    <ul className="child">
                        <Tree data={node.children} />
                    </ul>
                </div>
            )}
            {hasChild && childVisible && node.module && (
                <div className="child">
                    <table>
                        <thead>
                            <tr>
                                <th>Modul</th>
                                <th>Lehrveranstaltung</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            )}
        </li>
    );
};

export default Tree;
