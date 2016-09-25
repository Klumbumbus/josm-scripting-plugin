package org.openstreetmap.josm.plugins.scripting.js.api;

import static org.openstreetmap.josm.tools.I18n.trn;

import java.util.Collection;

import org.openstreetmap.josm.data.osm.DataSet;
import org.openstreetmap.josm.data.osm.OsmPrimitive;
import org.openstreetmap.josm.gui.layer.OsmDataLayer;
import org.openstreetmap.josm.plugins.scripting.util.Assert;

public class DeleteMultiCommand extends MultiCommand {

    OsmPrimitive[] deleted;
    boolean[] oldstate;

    /**
     * Creates a command for deleting a collection of objects in a data layer.
     *
     * <ul>
     *   <li>null values are skipped</li>
     *   <li>removes duplicate objects only once</li>
     *   <li>orders the objects to remove according to their type, relations first, then ways, then nodes</li>
     * </ul>
     *
     * @param layer the layer where the objects are added to
     * @param toAdd the collection of objects to add
     */
    public DeleteMultiCommand(OsmDataLayer layer, Collection<OsmPrimitive> toDelete) {
        super(layer);
        Assert.assertArgNotNull(toDelete);
        toDelete = normalize(toDelete);
        deleted  = new OsmPrimitive[toDelete.size()];
        toDelete.toArray(deleted);
    }

    @Override
    public void fillModifiedData(Collection<OsmPrimitive> modified,
            Collection<OsmPrimitive> deleted, Collection<OsmPrimitive> added) {
        // empty - we have our own undo implementation
    }

    @Override
    public boolean executeCommand() {
        DataSet ds = getLayer().data;
        try {
            ds.beginUpdate();
            oldstate = new boolean[deleted.length];
            for (int i=0; i<deleted.length; i++) {
                oldstate[i] = deleted[i].isDeleted();
                deleted[i].setDeleted(true);
            }
        } finally {
            ds.endUpdate();
        }
        return true;
    }

    @Override
    public void undoCommand() {
        DataSet ds = getLayer().data;
        try {
            ds.beginUpdate();
            for (int i=0; i<deleted.length; i++) {
                deleted[i].setDeleted(oldstate[i]);
            }
        } finally {
            ds.endUpdate();
        }
    }

    @Override
    public String getDescriptionText() {
        return trn("Deleted {0} primitive", "Deleted {0} primitives", deleted.length);
    }
}