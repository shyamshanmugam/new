# Grad-CAM Status

Grad-CAM must be generated from a loaded, real CNN. It uses gradients of the
selected class with respect to the final convolutional feature map, weights
the channels by their mean gradient, and overlays the resulting heatmap on
the original image.

No verified trained CNN artifact is currently available, so no heatmap is
generated or claimed. Once the model is exported from Colab, generate
examples only from the clean holdout and record the actual convolutional layer
used.
