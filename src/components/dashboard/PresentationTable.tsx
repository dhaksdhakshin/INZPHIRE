import { useEffect, useState } from "react";

import type { FolderItem, Presentation } from "../../core/types";
import Icon from "./Icon";

interface PresentationTableProps {
  folders?: FolderItem[];
  items: Presentation[];
  mode: "presentations" | "shared";
  onCreatePresentation?: () => void;
  onCreateFolder?: () => void;
  onDuplicate: (presentationId: string) => void;
  onDelete: (itemId: string) => void;
  onShare?: (presentationId: string) => void;
  onSaveCopy?: (presentationId: string) => void;
}

export default function PresentationTable({
  folders = [],
  items,
  mode,
  onCreatePresentation,
  onCreateFolder,
  onDuplicate,
  onDelete,
  onShare,
  onSaveCopy,
}: PresentationTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    function closeMenu() {
      setOpenMenuId(null);
    }

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const showToolbar = mode === "presentations";

  return (
    <div className="table-card">
      {showToolbar ? (
        <div className="table-toolbar">
          <div className="table-toolbar__actions">
            <button type="button" className="button button--primary" onClick={onCreatePresentation}>
              + New presentation
            </button>
            <button type="button" className="button button--ghost" onClick={onCreateFolder}>
              + New folder
            </button>
          </div>
          <span className="table-toolbar__count">
            {folders.length + items.length} item{folders.length + items.length === 1 ? "" : "s"}
          </span>
        </div>
      ) : null}

      <div className="table">
        <div className="table__header">
          <span>Name</span>
          <span>{mode === "shared" ? "Shared by" : "Creator"}</span>
          <span>Edited</span>
          <span>{mode === "shared" ? "Access" : "Results"}</span>
          <span />
        </div>

        {mode === "presentations"
          ? folders.map((folder) => (
              <div className="table__row" key={folder.id}>
                <div className="table__name">
                  <span className="table__icon table__icon--folder">
                    <Icon name="folder" size={16} />
                  </span>
                  <div>
                    <strong>{folder.title}</strong>
                    <span>{folder.itemCount} presentations</span>
                  </div>
                </div>
                <span>-</span>
                <span>{folder.updatedAt}</span>
                <span>-</span>
                <div className="table__menu-cell">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuId(folder.id);
                    }}
                    aria-label={`More actions for ${folder.title}`}
                  >
                    <Icon name="more" size={16} />
                  </button>
                  {openMenuId === folder.id ? (
                    <div
                      className="row-menu"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(folder.id);
                          setOpenMenuId(null);
                        }}
                      >
                        Delete folder
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          : null}

        {items.map((item) => (
          <div className="table__row" key={item.id}>
            <div className="table__name">
              <span className="table__icon table__icon--presentation">
                <Icon name="play" size={14} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.slides} slides</span>
              </div>
            </div>
            <span>{mode === "shared" ? item.sharedBy ?? "Team workspace" : item.creator}</span>
            <span>{item.updatedAt}</span>
            <span>{mode === "shared" ? "Can view" : item.results}</span>
            <div className="table__menu-cell">
              <button
                type="button"
                className="icon-button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenuId(item.id);
                }}
                aria-label={`More actions for ${item.title}`}
              >
                <Icon name="more" size={16} />
              </button>
              {openMenuId === item.id ? (
                <div className="row-menu" onClick={(event) => event.stopPropagation()}>
                  {mode === "presentations" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onDuplicate(item.id);
                          setOpenMenuId(null);
                        }}
                      >
                        Duplicate
                      </button>
                      {onShare ? (
                        <button
                          type="button"
                          onClick={() => {
                            onShare(item.id);
                            setOpenMenuId(null);
                          }}
                        >
                          Simulate shared copy
                        </button>
                      ) : null}
                    </>
                  ) : null}

                  {mode === "shared" && onSaveCopy ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSaveCopy(item.id);
                        setOpenMenuId(null);
                      }}
                    >
                      Save a copy
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      onDelete(item.id);
                      setOpenMenuId(null);
                    }}
                  >
                    {mode === "shared" ? "Remove" : "Delete"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
