package org.openstreetmap.josm.plugins.scripting.js.api;

import static org.openstreetmap.josm.tools.I18n.trn;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import javax.swing.Icon;

import org.openstreetmap.josm.command.PseudoCommand;
import org.openstreetmap.josm.data.osm.DataSet;
import org.openstreetmap.josm.data.osm.OsmPrimitive;
import org.openstreetmap.josm.data.osm.PrimitiveData;
import org.openstreetmap.josm.gui.layer.OsmDataLayer;
import org.openstreetmap.josm.plugins.scripting.util.Assert;
import org.openstreetmap.josm.tools.ImageProvider;

public class ChangeMultiCommand extends MultiCommand {

    private Change change;
    private OsmPrimitive[] changed;
    private PrimitiveData[] oldState;

    /**
     * Creates a command for adding a collection of objects to a layer.
     *
     * <ul>
     *   <li>null values are skipped</li>
     *   <li>changes duplicate objects only once</li>
     * </ul>
     *
     * @param layer the layer where the objects are added to. Must not be null.
     * @param toChange the collection of objects to add. Must not be null.
     * @param change the change to apply. Must not be null
     * @throws IllegalArgumentException thrown if one of the parameters is null
     */
    public ChangeMultiCommand(OsmDataLayer layer, Collection<OsmPrimitive> toChange, Change change){
        super(layer);
        Assert.assertArgNotNull(toChange);
        Assert.assertArgNotNull(change);
        List<OsmPrimitive> normalized = normalize(toChange);
        changed = new OsmPrimitive[normalized.size()];
        normalized.toArray(changed);
        this.change = change;
    }

    @Override
    public void fillModifiedData(Collection<OsmPrimitive> modified, Collection<OsmPrimitive> deleted, Collection<OsmPrimitive> added) {
        // empty - we have our own undo implementation
    }

    @Override
    public String getDescriptionText() {
        return trn("Changed {0} primitive", "Changed {0} primitives", changed.length, changed.length);
    }

    @Override
    public boolean executeCommand() {
        DataSet ds = getLayer().data;
        try {
            oldState = new PrimitiveData[changed.length];
            ds.beginUpdate();
            for (int i=0; i< changed.length; i++) {
                OsmPrimitive p = changed[i];
                oldState[i] = p.save();
                change.apply(p);
                p.setModified(true);
            }
            return true;
        } finally {
            ds.endUpdate();
        }
    }

    @Override
    public void undoCommand() {
        DataSet ds = getLayer().data;
        try {
            ds.beginUpdate();
            for (int i=changed.length-1; i>=0; i--){
                OsmPrimitive p = changed[i];
                p.load(oldState[i]);
            }
        } finally {
            ds.endUpdate();
        }
    }

    @Override
    public Collection<PseudoCommand> getChildren() {
        List<PseudoCommand> children = new ArrayList<>();
        for (final OsmPrimitive p: changed) {
            PseudoCommand cmd = new PseudoCommand() {
                @Override
                public Collection<? extends OsmPrimitive> getParticipatingPrimitives() {
                    return Collections.singleton(p);
                }

                @Override
                public String getDescriptionText() {
                    return change.explain(p);
                }

                @Override
                public Icon getDescriptionIcon() {
                    return ImageProvider.get(p.getType());
                }
            };
            children.add(cmd);
        }
        return children;
    }
}